import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLSchema,
  isListType
} from 'graphql';
import { printJSON } from '../utils/print';

type Field = GraphQLField<any, any>;
type Dict = { [key: string]: any };

export type QueryItem = {
  opType: string;
  schemaKey: string; // ex me
  entityName: string; // ex User
  varsToTypesStr?: string; // ex page: $page, perPage: $perPage, filter: $filter, sort: $sort
  query: string; // ex me { email password }
  argumentsDict: Dict;
  queryHeader: string;
  queryBody: string;
  queryFooter: string;
  field: Field;
  queryParts: [string, string, string]; // header, body (fragment), closing tags
};

// taken from
// TODO integrate with resolversHelper;

export function generateQuery(config: {
  schema: GraphQLSchema;
  depthLimit?: number;
  includeDeprecatedFields?: boolean;
}) {
  const { schema, depthLimit = 1, includeDeprecatedFields = false } = config;

  /**
   * Compile arguments dictionary for a field
   * @param field current field object
   * @param duplicateArgCounts map for deduping argument name collisions
   * @param allArgsDict dictionary of all arguments
   */
  const getFieldArgsDict = (
    field: Field,
    duplicateArgCounts: Dict = {},
    allArgsDict: any = {}
  ) =>
    field.args.reduce((o: any, arg) => {
      if (arg.name in duplicateArgCounts) {
        const index = duplicateArgCounts[arg.name] + 1;
        duplicateArgCounts[arg.name] = index;
        o[`${arg.name}${index}`] = arg;
      } else if (allArgsDict[arg.name]) {
        duplicateArgCounts[arg.name] = 1;
        o[`${arg.name}1`] = arg;
      } else {
        o[arg.name] = arg;
      }
      return o;
    }, {});

  /**
   * Generate variables string
   * @param dict dictionary of arguments
   */
  const getArgsToVarsStr = (dict: Dict) =>
    Object.entries(dict)
      .map(([varName, arg]) => `${arg.name}: $${varName}`)
      .join(', ');

  /**
   * Generate types string
   * @param dict dictionary of arguments
   */
  const getVarsToTypesStr = (dict: Dict) =>
    Object.entries(dict)
      .map(([varName, arg]) => `$${varName}: ${arg.type}`)
      .join(', ');

  /**
   * Generate the query for the specified field
   * @param curName name of the current field
   * @param curParentType parent type of the current field
   * @param curParentName parent name of the current field
   * @param argumentsDict dictionary of arguments from all fields
   * @param duplicateArgCounts map for deduping argument name collisions
   * @param crossReferenceKeyList list of the cross reference
   * @param curDepth current depth of field
   */
  const generateQuery = (
    curName: string,
    curParentType: string,
    curParentName?: string,
    argumentsDict?: Dict,
    duplicateArgCounts?: Dict,
    crossReferenceKeyList?: string[], // [`${curParentName}To${curName}Key`]
    curDepth?: number
  ): { queryStr: string; argumentsDict: Dict; field: Field } => {
    argumentsDict = argumentsDict || {};
    duplicateArgCounts = duplicateArgCounts || {};
    crossReferenceKeyList = crossReferenceKeyList || [];
    curDepth = curDepth || 1;

    const fieldType = schema.getType(curParentType) as GraphQLObjectType;
    if (!fieldType) {
      throw new Error('no field for ' + curParentType);
    }

    const field = fieldType.getFields()[curName];

    const curTypeName = field.type.inspect().replace(/[[\]!]/g, '');
    const curType = schema.getType(curTypeName) as GraphQLObjectType;
    let queryStr = '';
    let childQuery = '';

    if (!curType) {
      throw new Error('no field for ' + curTypeName);
    }

    if (curType.getFields) {
      const crossReferenceKey = `${curParentName}To${curName}Key`;
      const fields = curType.getFields();
      const childKeys = Object.keys(fields);

      if (
        crossReferenceKeyList.indexOf(crossReferenceKey) !== -1 ||
        curDepth > depthLimit
      ) {
        return { queryStr: '', argumentsDict: {}, field };
      }

      crossReferenceKeyList.push(crossReferenceKey);
      childQuery = childKeys
        .filter(fieldName => {
          /* Exclude deprecated fields */
          const type = schema.getType(curType.name) as GraphQLObjectType;
          if (!type) return null;
          const fieldSchema = type.getFields()[fieldName];
          return includeDeprecatedFields || !fieldSchema.isDeprecated;
        })
        .map(cur => {
          if (!curDepth) throw Error('shutupts');
          return generateQuery(
            cur,
            curType.name,
            curName,
            argumentsDict,
            duplicateArgCounts,
            crossReferenceKeyList,
            curDepth + 1
          ).queryStr;
        })
        .filter(cur => cur)
        .join('\n');
    }

    if (!(curType.getFields && !childQuery)) {
      queryStr = `${'    '.repeat(curDepth)}${field.name}`;
      if (field.args.length > 0) {
        const dict = getFieldArgsDict(field, duplicateArgCounts, argumentsDict);
        Object.assign(argumentsDict, dict);
        queryStr += `(${getArgsToVarsStr(dict)})`;
      }
      if (childQuery) {
        queryStr += `{\n${childQuery}\n${'    '.repeat(curDepth)}}`;
      }
    }

    /* Union types */
    const kind = curType && curType.astNode && curType.astNode.kind;
    if (kind && kind.toString() === 'UnionTypeDefinition') {
      const types = (curType as any).getTypes();
      if (types && types.length) {
        const indent = `${'    '.repeat(curDepth)}`;
        const fragIndent = `${'    '.repeat(curDepth + 1)}`;
        queryStr += '{\n';

        for (let i = 0, len = types.length; i < len; i++) {
          const valueTypeName = types[i];
          const valueType = schema.getType(valueTypeName) as GraphQLObjectType;
          if (!valueType) continue;
          const unionChildQuery = Object.keys(valueType.getFields())
            .map(cur => {
              if (!curDepth) throw Error('shutupts');
              return generateQuery(
                cur,
                valueType.name,
                curName,
                argumentsDict,
                duplicateArgCounts,
                crossReferenceKeyList,
                curDepth + 2
              ).queryStr;
            })
            .filter(cur => cur)
            .join('\n');
          queryStr += `${fragIndent}... on ${valueTypeName} {\n${unionChildQuery}\n${fragIndent}}\n`;
        }
        queryStr += `${indent}}`;
      }
    }
    return { queryStr, argumentsDict: argumentsDict || {}, field };
  };

  const queries = new Map<string, QueryItem>([]);

  /**
   * Generate the query for the specified field
   * @param obj one of the root objects(Query, Mutation, Subscription)
   * @param description description of the current object
   */
  const generateFile = (obj: GraphQLObjectType, description = '') => {
    const keys = Object.keys(obj);
    keys.forEach(schemaKey => {
      const gqlType = schema.getType(description) as GraphQLObjectType;
      if (!gqlType) return;
      const field = gqlType.getFields()[schemaKey];

      /* Only process non-deprecated queries/mutations: */
      if (includeDeprecatedFields || !field.isDeprecated) {
        const queryResult = generateQuery(schemaKey, description);
        const varsToTypesStr = getVarsToTypesStr(queryResult.argumentsDict);
        let query = queryResult.queryStr;

        const opType = description.toLowerCase();

        query = `${opType} ${schemaKey}${
          varsToTypesStr ? `(${varsToTypesStr})` : ''
        }{\n${query}\n}`;

        const type = isListType(field.type) ? field.type.ofType : field.type;
        // use type.name for object and toString for scalars
        let entityName = type.name || type.toString();

        const queryLines = query.split('\n');

        let queryHeader = '';
        let queryBody = '';
        let queryFooter = '';

        if (queryLines.length >= 5) {
          // start, declare vars --> query userPagination($page: Int,...
          queryHeader = queryLines.slice(0, 2).join('\n');
          // line 2... query applying vars -->  userPagination(page: $page,...
          queryBody = queryLines.slice(2, -2).join('\n');
          // closing tags
          queryFooter = queryLines.slice(-2).join('\n');
        }

        if (queryLines.length === 3) {
          queryHeader = queryLines[0];
          queryBody = queryLines[1];
          queryFooter = queryLines[2];
        }

        if (!queryHeader) {
          printJSON(queryLines);
          throw new Error('invalid queryParts');
        }
        
        queries.set(schemaKey, {
          opType,
          entityName,
          schemaKey, // ex user
          argumentsDict: queryResult.argumentsDict,
          varsToTypesStr, // ex page: $page, perPage: $perPage, filter: $filter, sort: $sort
          query, // ex me { email password }
          queryHeader,
          queryBody,
          queryFooter,
          queryParts: [queryHeader, queryBody, queryFooter],
          field: queryResult.field
        });
      }
    });
  };

  // const m = Object.keys(schema.getMutationType().getFields());
  // const q = Object.keys(schema.getQueryType().getFields());
  // console.log(printJSON({s: [...resolversStore.keys()], keys: [...q, ...m] }));

  if (schema.getMutationType()) {
    //@ts-ignore
    generateFile(schema.getMutationType().getFields(), 'Mutation');
  }

  if (schema.getQueryType()) {
    //@ts-ignore
    generateFile(schema.getQueryType().getFields(), 'Query');
  }

  if (schema.getSubscriptionType()) {
    //@ts-ignore
    generateFile(schema.getSubscriptionType().getFields(), 'Subscription');
  }

  return queries;
}

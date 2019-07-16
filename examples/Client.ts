export const query = {
  echo: (fragment = '') => `
        query echo($text: String){
                ${fragment ||
                  `
                    echo(text: $text)
                `}
        }`,

  group: (fragment = '') => `
        query group($fullPath: ID!){
            group(fullPath: $fullPath){
                ${fragment ||
                  `
                        avatarUrl
                        description
                        descriptionHtml
                        epicsEnabled
                        fullName
                        fullPath
                        id
                        lfsEnabled
                        name
                        path
                        requestAccessEnabled
                        visibility
                        webUrl
                `}
            }
        }`,

  metadata: (fragment = '') => `
        query metadata{
            metadata{
                ${fragment ||
                  `
                        revision
                        version
                `}
            }
        }`,

  namespace: (fragment = '') => `
        query namespace($fullPath: ID!){
            namespace(fullPath: $fullPath){
                ${fragment ||
                  `
                        description
                        descriptionHtml
                        fullName
                        fullPath
                        id
                        lfsEnabled
                        name
                        path
                        requestAccessEnabled
                        visibility
                `}
            }
        }`,

  project: (fragment = '') => `
        query project($fullPath: ID!){
            project(fullPath: $fullPath){
                ${fragment ||
                  `
                        archived
                        avatarUrl
                        containerRegistryEnabled
                        createdAt
                        description
                        descriptionHtml
                        forksCount
                        fullPath
                        httpUrlToRepo
                        id
                        importStatus
                        issuesEnabled
                        jobsEnabled
                        lastActivityAt
                        lfsEnabled
                        mergeRequestsEnabled
                        mergeRequestsFfOnlyEnabled
                        name
                        nameWithNamespace
                        onlyAllowMergeIfAllDiscussionsAreResolved
                        onlyAllowMergeIfPipelineSucceeds
                        openIssuesCount
                        path
                        printingMergeRequestLinkEnabled
                        publicJobs
                        requestAccessEnabled
                        sharedRunnersEnabled
                        snippetsEnabled
                        sshUrlToRepo
                        starCount
                        tagList
                        visibility
                        webUrl
                        wikiEnabled
                `}
            }
        }`,

  addAwardEmoji: (fragment = '') => `
        mutation addAwardEmoji($input: AddAwardEmojiInput!){
            addAwardEmoji(input: $input){
                ${fragment ||
                  `
                        clientMutationId
                        errors
                `}
            }
        }`,

  designManagementUpload: (fragment = '') => `
        mutation designManagementUpload($input: DesignManagementUploadInput!){
            designManagementUpload(input: $input){
                ${fragment ||
                  `
                        clientMutationId
                        errors
                `}
            }
        }`,

  mergeRequestSetWip: (fragment = '') => `
        mutation mergeRequestSetWip($input: MergeRequestSetWipInput!){
            mergeRequestSetWip(input: $input){
                ${fragment ||
                  `
                        clientMutationId
                        errors
                `}
            }
        }`,

  removeAwardEmoji: (fragment = '') => `
        mutation removeAwardEmoji($input: RemoveAwardEmojiInput!){
            removeAwardEmoji(input: $input){
                ${fragment ||
                  `
                        clientMutationId
                        errors
                `}
            }
        }`,

  toggleAwardEmoji: (fragment = '') => `
        mutation toggleAwardEmoji($input: ToggleAwardEmojiInput!){
            toggleAwardEmoji(input: $input){
                ${fragment ||
                  `
                        clientMutationId
                        errors
                        toggledOn
                `}
            }
        }`
};

export type Maybe<T> = T | null;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Time: any;
  Upload: any;
};

/** Autogenerated input type of AddAwardEmoji */
export type AddAwardEmojiInput = {
  /** The global id of the awardable resource */
  awardableId: Scalars['ID'];
  /** The emoji name */
  name: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
};

/** Autogenerated return type of AddAwardEmoji */
export type AddAwardEmojiPayload = {
  __typename?: 'AddAwardEmojiPayload';
  /** The award emoji after mutation */
  awardEmoji?: Maybe<AwardEmoji>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reasons why the mutation failed. */
  errors: Array<Scalars['String']>;
};

export type AwardEmoji = {
  __typename?: 'AwardEmoji';
  /** The emoji description */
  description: Scalars['String'];
  /** The emoji as an icon */
  emoji: Scalars['String'];
  /** The emoji name */
  name: Scalars['String'];
  /** The emoji in unicode */
  unicode: Scalars['String'];
  /** The unicode version for this emoji */
  unicodeVersion: Scalars['String'];
  /** The user who awarded the emoji */
  user: User;
};

export type Blob = Entry & {
  __typename?: 'Blob';
  flatPath: Scalars['String'];
  id: Scalars['ID'];
  lfsOid?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  path: Scalars['String'];
  type: EntryType;
  webUrl?: Maybe<Scalars['String']>;
};

/** The connection type for Blob. */
export type BlobConnection = {
  __typename?: 'BlobConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BlobEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type BlobEdge = {
  __typename?: 'BlobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Blob>;
};

export type Commit = {
  __typename?: 'Commit';
  author?: Maybe<User>;
  authoredDate?: Maybe<Scalars['Time']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  /** Latest pipeline for this commit */
  latestPipeline?: Maybe<Pipeline>;
  message?: Maybe<Scalars['String']>;
  sha: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  webUrl: Scalars['String'];
};

export type Design = Noteable & {
  __typename?: 'Design';
  /** All discussions on this noteable */
  discussions: DiscussionConnection;
  filename: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
  issue: Issue;
  /** All notes on this noteable */
  notes: NoteConnection;
  project: Project;
  /** All versions related to this design ordered newest first */
  versions: DesignVersionConnection;
};

export type DesignDiscussionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type DesignNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type DesignVersionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type DesignCollection = {
  __typename?: 'DesignCollection';
  /** All visible designs for this collection */
  designs: DesignConnection;
  issue: Issue;
  project: Project;
  /** All versions related to all designs ordered newest first */
  versions: DesignVersionConnection;
};

export type DesignCollectionDesignsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  atVersion?: Maybe<Scalars['ID']>;
};

export type DesignCollectionVersionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

/** The connection type for Design. */
export type DesignConnection = {
  __typename?: 'DesignConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DesignEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DesignEdge = {
  __typename?: 'DesignEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Design>;
};

/** Autogenerated input type of DesignManagementUpload */
export type DesignManagementUploadInput = {
  /** The project where the issue is to upload designs for */
  projectPath: Scalars['ID'];
  /** The iid of the issue to modify designs for */
  iid: Scalars['ID'];
  /** The files to upload */
  files: Array<Scalars['Upload']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
};

/** Autogenerated return type of DesignManagementUpload */
export type DesignManagementUploadPayload = {
  __typename?: 'DesignManagementUploadPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** The designs that were updated by the mutation */
  designs: Array<Design>;
  /** Reasons why the mutation failed. */
  errors: Array<Scalars['String']>;
};

export type DesignVersion = {
  __typename?: 'DesignVersion';
  /** All designs that were changed in this version */
  designs: DesignConnection;
  id: Scalars['ID'];
  sha: Scalars['ID'];
};

export type DesignVersionDesignsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

/** The connection type for DesignVersion. */
export type DesignVersionConnection = {
  __typename?: 'DesignVersionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DesignVersionEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DesignVersionEdge = {
  __typename?: 'DesignVersionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DesignVersion>;
};

export type DetailedStatus = {
  __typename?: 'DetailedStatus';
  detailsPath: Scalars['String'];
  favicon: Scalars['String'];
  group: Scalars['String'];
  hasDetails: Scalars['Boolean'];
  icon: Scalars['String'];
  label: Scalars['String'];
  text: Scalars['String'];
  tooltip: Scalars['String'];
};

export type DiffPosition = {
  __typename?: 'DiffPosition';
  /** The merge base of the branch the comment was made on */
  baseSha?: Maybe<Scalars['String']>;
  /** The path of the file that was changed */
  filePath: Scalars['String'];
  /** The sha of the head at the time the comment was made */
  headSha: Scalars['String'];
  /** The total height of the image */
  height?: Maybe<Scalars['Int']>;
  /** The line on head sha that was changed */
  newLine?: Maybe<Scalars['Int']>;
  /** The path of the file on the head sha. */
  newPath?: Maybe<Scalars['String']>;
  /** The line on start sha that was changed */
  oldLine?: Maybe<Scalars['Int']>;
  /** The path of the file on the start sha. */
  oldPath?: Maybe<Scalars['String']>;
  positionType: DiffPositionType;
  /** The sha of the branch being compared against */
  startSha: Scalars['String'];
  /** The total width of the image */
  width?: Maybe<Scalars['Int']>;
  /** The X postion on which the comment was made */
  x?: Maybe<Scalars['Int']>;
  /** The Y position on which the comment was made */
  y?: Maybe<Scalars['Int']>;
};

/** Type of file the position refers to */
export enum DiffPositionType {
  Text = 'text',
  Image = 'image'
}

export type Discussion = {
  __typename?: 'Discussion';
  createdAt: Scalars['Time'];
  id: Scalars['ID'];
  /** All notes in the discussion */
  notes: NoteConnection;
};

export type DiscussionNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

/** The connection type for Discussion. */
export type DiscussionConnection = {
  __typename?: 'DiscussionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DiscussionEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DiscussionEdge = {
  __typename?: 'DiscussionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Discussion>;
};

export type Entry = {
  __typename?: 'Entry';
  flatPath: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  path: Scalars['String'];
  type: EntryType;
};

/** Type of a tree entry */
export enum EntryType {
  Tree = 'tree',
  Blob = 'blob',
  Commit = 'commit'
}

export type Epic = Noteable & {
  __typename?: 'Epic';
  author: User;
  children?: Maybe<EpicConnection>;
  closedAt?: Maybe<Scalars['Time']>;
  createdAt?: Maybe<Scalars['Time']>;
  description?: Maybe<Scalars['String']>;
  /** All discussions on this noteable */
  discussions: DiscussionConnection;
  dueDate?: Maybe<Scalars['Time']>;
  dueDateFixed?: Maybe<Scalars['Time']>;
  dueDateFromMilestones?: Maybe<Scalars['Time']>;
  dueDateIsFixed?: Maybe<Scalars['Boolean']>;
  group: Group;
  hasChildren: Scalars['Boolean'];
  hasIssues: Scalars['Boolean'];
  id: Scalars['ID'];
  iid: Scalars['ID'];
  issues?: Maybe<EpicIssueConnection>;
  /** All notes on this noteable */
  notes: NoteConnection;
  parent?: Maybe<Epic>;
  reference: Scalars['String'];
  relationPath?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['Time']>;
  startDateFixed?: Maybe<Scalars['Time']>;
  startDateFromMilestones?: Maybe<Scalars['Time']>;
  startDateIsFixed?: Maybe<Scalars['Boolean']>;
  state: EpicState;
  title?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Time']>;
  /** Permissions for the current user on the resource */
  userPermissions: EpicPermissions;
  webPath: Scalars['String'];
  webUrl: Scalars['String'];
};

export type EpicChildrenArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  iid?: Maybe<Scalars['ID']>;
  iids?: Maybe<Array<Scalars['ID']>>;
};

export type EpicDiscussionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicIssuesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicReferenceArgs = {
  full: Scalars['Boolean'];
};

/** The connection type for Epic. */
export type EpicConnection = {
  __typename?: 'EpicConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EpicEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EpicEdge = {
  __typename?: 'EpicEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Epic>;
};

export type EpicIssue = Noteable & {
  __typename?: 'EpicIssue';
  assignees?: Maybe<UserConnection>;
  author: User;
  closedAt?: Maybe<Scalars['Time']>;
  confidential: Scalars['Boolean'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  designs?: Maybe<DesignCollection>;
  discussionLocked: Scalars['Boolean'];
  /** All discussions on this noteable */
  discussions: DiscussionConnection;
  downvotes: Scalars['Int'];
  dueDate?: Maybe<Scalars['Time']>;
  epicIssueId: Scalars['ID'];
  iid: Scalars['ID'];
  labels?: Maybe<LabelConnection>;
  milestone?: Maybe<Milestone>;
  /** All notes on this noteable */
  notes: NoteConnection;
  reference: Scalars['String'];
  relationPath?: Maybe<Scalars['String']>;
  relativePosition?: Maybe<Scalars['Int']>;
  state: IssueState;
  taskCompletionStatus: TaskCompletionStatus;
  title: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
  upvotes: Scalars['Int'];
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: IssuePermissions;
  webPath: Scalars['String'];
  webUrl: Scalars['String'];
  weight?: Maybe<Scalars['Int']>;
};

export type EpicIssueAssigneesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicIssueDiscussionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicIssueLabelsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicIssueNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type EpicIssueReferenceArgs = {
  full: Scalars['Boolean'];
};

/** The connection type for EpicIssue. */
export type EpicIssueConnection = {
  __typename?: 'EpicIssueConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EpicIssueEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EpicIssueEdge = {
  __typename?: 'EpicIssueEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<EpicIssue>;
};

/** Check permissions for the current user on an epic */
export type EpicPermissions = {
  __typename?: 'EpicPermissions';
  /** Whether or not a user can perform `admin_epic` on this resource */
  adminEpic: Scalars['Boolean'];
  /** Whether or not a user can perform `award_emoji` on this resource */
  awardEmoji: Scalars['Boolean'];
  /** Whether or not a user can perform `create_epic` on this resource */
  createEpic: Scalars['Boolean'];
  /** Whether or not a user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Whether or not a user can perform `destroy_epic` on this resource */
  destroyEpic: Scalars['Boolean'];
  /** Whether or not a user can perform `read_epic` on this resource */
  readEpic: Scalars['Boolean'];
  /** Whether or not a user can perform `read_epic_iid` on this resource */
  readEpicIid: Scalars['Boolean'];
  /** Whether or not a user can perform `update_epic` on this resource */
  updateEpic: Scalars['Boolean'];
};

/** State of a GitLab epic */
export enum EpicState {
  Opened = 'opened',
  Closed = 'closed'
}

export type Group = {
  __typename?: 'Group';
  avatarUrl?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  epic?: Maybe<Epic>;
  epics?: Maybe<EpicConnection>;
  epicsEnabled?: Maybe<Scalars['Boolean']>;
  fullName: Scalars['String'];
  fullPath: Scalars['ID'];
  id: Scalars['ID'];
  lfsEnabled?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  parent?: Maybe<Group>;
  path: Scalars['String'];
  projects: ProjectConnection;
  requestAccessEnabled?: Maybe<Scalars['Boolean']>;
  /** Permissions for the current user on the resource */
  userPermissions: GroupPermissions;
  visibility?: Maybe<Scalars['String']>;
  webUrl: Scalars['String'];
};

export type GroupEpicArgs = {
  iid?: Maybe<Scalars['ID']>;
  iids?: Maybe<Array<Scalars['ID']>>;
};

export type GroupEpicsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  iid?: Maybe<Scalars['ID']>;
  iids?: Maybe<Array<Scalars['ID']>>;
};

export type GroupProjectsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  includeSubgroups: Scalars['Boolean'];
};

export type GroupPermissions = {
  __typename?: 'GroupPermissions';
  /** Whether or not a user can perform `read_group` on this resource */
  readGroup: Scalars['Boolean'];
};

/** State of a GitLab issue or merge request */
export enum IssuableState {
  Opened = 'opened',
  Closed = 'closed',
  Locked = 'locked'
}

export type Issue = Noteable & {
  __typename?: 'Issue';
  assignees?: Maybe<UserConnection>;
  author: User;
  closedAt?: Maybe<Scalars['Time']>;
  confidential: Scalars['Boolean'];
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  designs?: Maybe<DesignCollection>;
  discussionLocked: Scalars['Boolean'];
  /** All discussions on this noteable */
  discussions: DiscussionConnection;
  downvotes: Scalars['Int'];
  dueDate?: Maybe<Scalars['Time']>;
  iid: Scalars['ID'];
  labels?: Maybe<LabelConnection>;
  milestone?: Maybe<Milestone>;
  /** All notes on this noteable */
  notes: NoteConnection;
  reference: Scalars['String'];
  relativePosition?: Maybe<Scalars['Int']>;
  state: IssueState;
  taskCompletionStatus: TaskCompletionStatus;
  title: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
  upvotes: Scalars['Int'];
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: IssuePermissions;
  webPath: Scalars['String'];
  webUrl: Scalars['String'];
  weight?: Maybe<Scalars['Int']>;
};

export type IssueAssigneesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type IssueDiscussionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type IssueLabelsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type IssueNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type IssueReferenceArgs = {
  full: Scalars['Boolean'];
};

/** The connection type for Issue. */
export type IssueConnection = {
  __typename?: 'IssueConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IssueEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type IssueEdge = {
  __typename?: 'IssueEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Issue>;
};

/** Check permissions for the current user on a issue */
export type IssuePermissions = {
  __typename?: 'IssuePermissions';
  /** Whether or not a user can perform `admin_issue` on this resource */
  adminIssue: Scalars['Boolean'];
  /** Whether or not a user can perform `create_design` on this resource */
  createDesign: Scalars['Boolean'];
  /** Whether or not a user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Whether or not a user can perform `destroy_design` on this resource */
  destroyDesign: Scalars['Boolean'];
  /** Whether or not a user can perform `read_design` on this resource */
  readDesign: Scalars['Boolean'];
  /** Whether or not a user can perform `read_issue` on this resource */
  readIssue: Scalars['Boolean'];
  /** Whether or not a user can perform `reopen_issue` on this resource */
  reopenIssue: Scalars['Boolean'];
  /** Whether or not a user can perform `update_issue` on this resource */
  updateIssue: Scalars['Boolean'];
};

/** State of a GitLab issue */
export enum IssueState {
  Opened = 'opened',
  Closed = 'closed',
  Locked = 'locked'
}

export type Label = {
  __typename?: 'Label';
  color: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  textColor: Scalars['String'];
  title: Scalars['String'];
};

/** The connection type for Label. */
export type LabelConnection = {
  __typename?: 'LabelConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<LabelEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type LabelEdge = {
  __typename?: 'LabelEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Label>;
};

export type MergeRequest = Noteable & {
  __typename?: 'MergeRequest';
  allowCollaboration?: Maybe<Scalars['Boolean']>;
  createdAt: Scalars['Time'];
  defaultMergeCommitMessage?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  diffHeadSha?: Maybe<Scalars['String']>;
  /** All discussions on this noteable */
  discussions: DiscussionConnection;
  downvotes: Scalars['Int'];
  forceRemoveSourceBranch?: Maybe<Scalars['Boolean']>;
  headPipeline?: Maybe<Pipeline>;
  id: Scalars['ID'];
  iid: Scalars['String'];
  inProgressMergeCommitSha?: Maybe<Scalars['String']>;
  mergeCommitMessage?: Maybe<Scalars['String']>;
  mergeCommitSha?: Maybe<Scalars['String']>;
  mergeError?: Maybe<Scalars['String']>;
  mergeOngoing: Scalars['Boolean'];
  mergeStatus?: Maybe<Scalars['String']>;
  mergeWhenPipelineSucceeds?: Maybe<Scalars['Boolean']>;
  mergeableDiscussionsState?: Maybe<Scalars['Boolean']>;
  /** All notes on this noteable */
  notes: NoteConnection;
  pipelines: PipelineConnection;
  project: Project;
  projectId: Scalars['Int'];
  rebaseCommitSha?: Maybe<Scalars['String']>;
  rebaseInProgress: Scalars['Boolean'];
  shouldBeRebased: Scalars['Boolean'];
  shouldRemoveSourceBranch?: Maybe<Scalars['Boolean']>;
  sourceBranch: Scalars['String'];
  sourceBranchExists: Scalars['Boolean'];
  sourceProject?: Maybe<Project>;
  sourceProjectId?: Maybe<Scalars['Int']>;
  state: MergeRequestState;
  subscribed: Scalars['Boolean'];
  targetBranch: Scalars['String'];
  targetProject: Project;
  targetProjectId: Scalars['Int'];
  taskCompletionStatus: TaskCompletionStatus;
  title: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  updatedAt: Scalars['Time'];
  upvotes: Scalars['Int'];
  userNotesCount?: Maybe<Scalars['Int']>;
  /** Permissions for the current user on the resource */
  userPermissions: MergeRequestPermissions;
  webUrl?: Maybe<Scalars['String']>;
  workInProgress: Scalars['Boolean'];
};

export type MergeRequestDiscussionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type MergeRequestNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type MergeRequestPipelinesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  status?: Maybe<PipelineStatusEnum>;
  ref?: Maybe<Scalars['String']>;
  sha?: Maybe<Scalars['String']>;
};

/** The connection type for MergeRequest. */
export type MergeRequestConnection = {
  __typename?: 'MergeRequestConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MergeRequestEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MergeRequestEdge = {
  __typename?: 'MergeRequestEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MergeRequest>;
};

/** Check permissions for the current user on a merge request */
export type MergeRequestPermissions = {
  __typename?: 'MergeRequestPermissions';
  /** Whether or not a user can perform `admin_merge_request` on this resource */
  adminMergeRequest: Scalars['Boolean'];
  /** Whether or not a user can perform `cherry_pick_on_current_merge_request` on this resource */
  cherryPickOnCurrentMergeRequest: Scalars['Boolean'];
  /** Whether or not a user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Whether or not a user can perform `push_to_source_branch` on this resource */
  pushToSourceBranch: Scalars['Boolean'];
  /** Whether or not a user can perform `read_merge_request` on this resource */
  readMergeRequest: Scalars['Boolean'];
  /** Whether or not a user can perform `remove_source_branch` on this resource */
  removeSourceBranch: Scalars['Boolean'];
  /** Whether or not a user can perform `revert_on_current_merge_request` on this resource */
  revertOnCurrentMergeRequest: Scalars['Boolean'];
  /** Whether or not a user can perform `update_merge_request` on this resource */
  updateMergeRequest: Scalars['Boolean'];
};

/** Autogenerated input type of MergeRequestSetWip */
export type MergeRequestSetWipInput = {
  /** The project the merge request to mutate is in */
  projectPath: Scalars['ID'];
  /** The iid of the merge request to mutate */
  iid: Scalars['String'];
  /** Whether or not to set the merge request as a WIP. */
  wip: Scalars['Boolean'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
};

/** Autogenerated return type of MergeRequestSetWip */
export type MergeRequestSetWipPayload = {
  __typename?: 'MergeRequestSetWipPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reasons why the mutation failed. */
  errors: Array<Scalars['String']>;
  /** The merge request after mutation */
  mergeRequest?: Maybe<MergeRequest>;
};

/** State of a GitLab merge request */
export enum MergeRequestState {
  Opened = 'opened',
  Closed = 'closed',
  Locked = 'locked',
  Merged = 'merged'
}

export type Metadata = {
  __typename?: 'Metadata';
  revision: Scalars['String'];
  version: Scalars['String'];
};

export type Milestone = {
  __typename?: 'Milestone';
  createdAt: Scalars['Time'];
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['Time']>;
  startDate?: Maybe<Scalars['Time']>;
  state: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['Time'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addAwardEmoji?: Maybe<AddAwardEmojiPayload>;
  designManagementUpload?: Maybe<DesignManagementUploadPayload>;
  mergeRequestSetWip?: Maybe<MergeRequestSetWipPayload>;
  removeAwardEmoji?: Maybe<RemoveAwardEmojiPayload>;
  toggleAwardEmoji?: Maybe<ToggleAwardEmojiPayload>;
};

export type MutationAddAwardEmojiArgs = {
  input: AddAwardEmojiInput;
};

export type MutationDesignManagementUploadArgs = {
  input: DesignManagementUploadInput;
};

export type MutationMergeRequestSetWipArgs = {
  input: MergeRequestSetWipInput;
};

export type MutationRemoveAwardEmojiArgs = {
  input: RemoveAwardEmojiInput;
};

export type MutationToggleAwardEmojiArgs = {
  input: ToggleAwardEmojiInput;
};

export type Namespace = {
  __typename?: 'Namespace';
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  fullName: Scalars['String'];
  fullPath: Scalars['ID'];
  id: Scalars['ID'];
  lfsEnabled?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  path: Scalars['String'];
  projects: ProjectConnection;
  requestAccessEnabled?: Maybe<Scalars['Boolean']>;
  visibility?: Maybe<Scalars['String']>;
};

export type NamespaceProjectsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  includeSubgroups: Scalars['Boolean'];
};

export type Note = {
  __typename?: 'Note';
  /** The user who wrote this note */
  author: User;
  /** The content note itself */
  body: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `note` */
  bodyHtml?: Maybe<Scalars['String']>;
  createdAt: Scalars['Time'];
  /** The discussion this note is a part of */
  discussion?: Maybe<Discussion>;
  id: Scalars['ID'];
  /** The position of this note on a diff */
  position?: Maybe<DiffPosition>;
  /** The project this note is associated to */
  project?: Maybe<Project>;
  resolvable: Scalars['Boolean'];
  /** The time the discussion was resolved */
  resolvedAt?: Maybe<Scalars['Time']>;
  /** The user that resolved the discussion */
  resolvedBy?: Maybe<User>;
  /** Whether or not this note was created by the system or by a user */
  system: Scalars['Boolean'];
  updatedAt: Scalars['Time'];
  /** Permissions for the current user on the resource */
  userPermissions: NotePermissions;
};

export type Noteable = {
  __typename?: 'Noteable';
  /** All discussions on this noteable */
  discussions: DiscussionConnection;
  /** All notes on this noteable */
  notes: NoteConnection;
};

export type NoteableDiscussionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type NoteableNotesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

/** The connection type for Note. */
export type NoteConnection = {
  __typename?: 'NoteConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<NoteEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type NoteEdge = {
  __typename?: 'NoteEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Note>;
};

export type NotePermissions = {
  __typename?: 'NotePermissions';
  /** Whether or not a user can perform `admin_note` on this resource */
  adminNote: Scalars['Boolean'];
  /** Whether or not a user can perform `award_emoji` on this resource */
  awardEmoji: Scalars['Boolean'];
  /** Whether or not a user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Whether or not a user can perform `read_note` on this resource */
  readNote: Scalars['Boolean'];
  /** Whether or not a user can perform `resolve_note` on this resource */
  resolveNote: Scalars['Boolean'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type Pipeline = {
  __typename?: 'Pipeline';
  beforeSha?: Maybe<Scalars['String']>;
  committedAt?: Maybe<Scalars['Time']>;
  /** Coverage percentage */
  coverage?: Maybe<Scalars['Float']>;
  createdAt: Scalars['Time'];
  detailedStatus: DetailedStatus;
  /** Duration of the pipeline in seconds */
  duration?: Maybe<Scalars['Int']>;
  finishedAt?: Maybe<Scalars['Time']>;
  id: Scalars['ID'];
  iid: Scalars['String'];
  sha: Scalars['String'];
  startedAt?: Maybe<Scalars['Time']>;
  status: PipelineStatusEnum;
  updatedAt: Scalars['Time'];
  /** Permissions for the current user on the resource */
  userPermissions: PipelinePermissions;
};

/** The connection type for Pipeline. */
export type PipelineConnection = {
  __typename?: 'PipelineConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PipelineEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PipelineEdge = {
  __typename?: 'PipelineEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Pipeline>;
};

export type PipelinePermissions = {
  __typename?: 'PipelinePermissions';
  /** Whether or not a user can perform `admin_pipeline` on this resource */
  adminPipeline: Scalars['Boolean'];
  /** Whether or not a user can perform `destroy_pipeline` on this resource */
  destroyPipeline: Scalars['Boolean'];
  /** Whether or not a user can perform `update_pipeline` on this resource */
  updatePipeline: Scalars['Boolean'];
};

export enum PipelineStatusEnum {
  Created = 'CREATED',
  Preparing = 'PREPARING',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Failed = 'FAILED',
  Success = 'SUCCESS',
  Canceled = 'CANCELED',
  Skipped = 'SKIPPED',
  Manual = 'MANUAL',
  Scheduled = 'SCHEDULED'
}

export type Project = {
  __typename?: 'Project';
  archived?: Maybe<Scalars['Boolean']>;
  avatarUrl?: Maybe<Scalars['String']>;
  containerRegistryEnabled?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['Time']>;
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  forksCount: Scalars['Int'];
  fullPath: Scalars['ID'];
  group?: Maybe<Group>;
  httpUrlToRepo?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  importStatus?: Maybe<Scalars['String']>;
  issue?: Maybe<Issue>;
  issues?: Maybe<IssueConnection>;
  issuesEnabled?: Maybe<Scalars['Boolean']>;
  jobsEnabled?: Maybe<Scalars['Boolean']>;
  lastActivityAt?: Maybe<Scalars['Time']>;
  lfsEnabled?: Maybe<Scalars['Boolean']>;
  mergeRequest?: Maybe<MergeRequest>;
  mergeRequests?: Maybe<MergeRequestConnection>;
  mergeRequestsEnabled?: Maybe<Scalars['Boolean']>;
  mergeRequestsFfOnlyEnabled?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  nameWithNamespace: Scalars['String'];
  namespace?: Maybe<Namespace>;
  onlyAllowMergeIfAllDiscussionsAreResolved?: Maybe<Scalars['Boolean']>;
  onlyAllowMergeIfPipelineSucceeds?: Maybe<Scalars['Boolean']>;
  openIssuesCount?: Maybe<Scalars['Int']>;
  path: Scalars['String'];
  pipelines?: Maybe<PipelineConnection>;
  printingMergeRequestLinkEnabled?: Maybe<Scalars['Boolean']>;
  publicJobs?: Maybe<Scalars['Boolean']>;
  repository?: Maybe<Repository>;
  requestAccessEnabled?: Maybe<Scalars['Boolean']>;
  sharedRunnersEnabled?: Maybe<Scalars['Boolean']>;
  snippetsEnabled?: Maybe<Scalars['Boolean']>;
  sshUrlToRepo?: Maybe<Scalars['String']>;
  starCount: Scalars['Int'];
  statistics?: Maybe<ProjectStatistics>;
  tagList?: Maybe<Scalars['String']>;
  /** Permissions for the current user on the resource */
  userPermissions: ProjectPermissions;
  visibility?: Maybe<Scalars['String']>;
  webUrl?: Maybe<Scalars['String']>;
  wikiEnabled?: Maybe<Scalars['Boolean']>;
};

export type ProjectIssueArgs = {
  iid?: Maybe<Scalars['String']>;
  iids?: Maybe<Array<Scalars['String']>>;
  state?: Maybe<IssuableState>;
  labelName?: Maybe<Array<Maybe<Scalars['String']>>>;
  createdBefore?: Maybe<Scalars['Time']>;
  createdAfter?: Maybe<Scalars['Time']>;
  updatedBefore?: Maybe<Scalars['Time']>;
  updatedAfter?: Maybe<Scalars['Time']>;
  closedBefore?: Maybe<Scalars['Time']>;
  closedAfter?: Maybe<Scalars['Time']>;
  search?: Maybe<Scalars['String']>;
  sort: Sort;
};

export type ProjectIssuesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  iid?: Maybe<Scalars['String']>;
  iids?: Maybe<Array<Scalars['String']>>;
  state?: Maybe<IssuableState>;
  labelName?: Maybe<Array<Maybe<Scalars['String']>>>;
  createdBefore?: Maybe<Scalars['Time']>;
  createdAfter?: Maybe<Scalars['Time']>;
  updatedBefore?: Maybe<Scalars['Time']>;
  updatedAfter?: Maybe<Scalars['Time']>;
  closedBefore?: Maybe<Scalars['Time']>;
  closedAfter?: Maybe<Scalars['Time']>;
  search?: Maybe<Scalars['String']>;
  sort: Sort;
};

export type ProjectMergeRequestArgs = {
  iid?: Maybe<Scalars['String']>;
  iids?: Maybe<Array<Scalars['String']>>;
};

export type ProjectMergeRequestsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  iid?: Maybe<Scalars['String']>;
  iids?: Maybe<Array<Scalars['String']>>;
};

export type ProjectPipelinesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  status?: Maybe<PipelineStatusEnum>;
  ref?: Maybe<Scalars['String']>;
  sha?: Maybe<Scalars['String']>;
};

/** The connection type for Project. */
export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ProjectEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Project>;
};

export type ProjectPermissions = {
  __typename?: 'ProjectPermissions';
  /** Whether or not a user can perform `admin_project` on this resource */
  adminProject: Scalars['Boolean'];
  /** Whether or not a user can perform `admin_remote_mirror` on this resource */
  adminRemoteMirror: Scalars['Boolean'];
  /** Whether or not a user can perform `admin_wiki` on this resource */
  adminWiki: Scalars['Boolean'];
  /** Whether or not a user can perform `archive_project` on this resource */
  archiveProject: Scalars['Boolean'];
  /** Whether or not a user can perform `change_namespace` on this resource */
  changeNamespace: Scalars['Boolean'];
  /** Whether or not a user can perform `change_visibility_level` on this resource */
  changeVisibilityLevel: Scalars['Boolean'];
  /** Whether or not a user can perform `create_deployment` on this resource */
  createDeployment: Scalars['Boolean'];
  /** Whether or not a user can perform `create_design` on this resource */
  createDesign: Scalars['Boolean'];
  /** Whether or not a user can perform `create_issue` on this resource */
  createIssue: Scalars['Boolean'];
  /** Whether or not a user can perform `create_label` on this resource */
  createLabel: Scalars['Boolean'];
  /** Whether or not a user can perform `create_merge_request_from` on this resource */
  createMergeRequestFrom: Scalars['Boolean'];
  /** Whether or not a user can perform `create_merge_request_in` on this resource */
  createMergeRequestIn: Scalars['Boolean'];
  /** Whether or not a user can perform `create_pages` on this resource */
  createPages: Scalars['Boolean'];
  /** Whether or not a user can perform `create_pipeline` on this resource */
  createPipeline: Scalars['Boolean'];
  /** Whether or not a user can perform `create_pipeline_schedule` on this resource */
  createPipelineSchedule: Scalars['Boolean'];
  /** Whether or not a user can perform `create_project_snippet` on this resource */
  createProjectSnippet: Scalars['Boolean'];
  /** Whether or not a user can perform `create_wiki` on this resource */
  createWiki: Scalars['Boolean'];
  /** Whether or not a user can perform `destroy_design` on this resource */
  destroyDesign: Scalars['Boolean'];
  /** Whether or not a user can perform `destroy_pages` on this resource */
  destroyPages: Scalars['Boolean'];
  /** Whether or not a user can perform `destroy_wiki` on this resource */
  destroyWiki: Scalars['Boolean'];
  /** Whether or not a user can perform `download_code` on this resource */
  downloadCode: Scalars['Boolean'];
  /** Whether or not a user can perform `download_wiki_code` on this resource */
  downloadWikiCode: Scalars['Boolean'];
  /** Whether or not a user can perform `fork_project` on this resource */
  forkProject: Scalars['Boolean'];
  /** Whether or not a user can perform `push_code` on this resource */
  pushCode: Scalars['Boolean'];
  /** Whether or not a user can perform `push_to_delete_protected_branch` on this resource */
  pushToDeleteProtectedBranch: Scalars['Boolean'];
  /** Whether or not a user can perform `read_commit_status` on this resource */
  readCommitStatus: Scalars['Boolean'];
  /** Whether or not a user can perform `read_cycle_analytics` on this resource */
  readCycleAnalytics: Scalars['Boolean'];
  /** Whether or not a user can perform `read_design` on this resource */
  readDesign: Scalars['Boolean'];
  /** Whether or not a user can perform `read_pages_content` on this resource */
  readPagesContent: Scalars['Boolean'];
  /** Whether or not a user can perform `read_project` on this resource */
  readProject: Scalars['Boolean'];
  /** Whether or not a user can perform `read_project_member` on this resource */
  readProjectMember: Scalars['Boolean'];
  /** Whether or not a user can perform `read_wiki` on this resource */
  readWiki: Scalars['Boolean'];
  /** Whether or not a user can perform `remove_fork_project` on this resource */
  removeForkProject: Scalars['Boolean'];
  /** Whether or not a user can perform `remove_pages` on this resource */
  removePages: Scalars['Boolean'];
  /** Whether or not a user can perform `remove_project` on this resource */
  removeProject: Scalars['Boolean'];
  /** Whether or not a user can perform `rename_project` on this resource */
  renameProject: Scalars['Boolean'];
  /** Whether or not a user can perform `request_access` on this resource */
  requestAccess: Scalars['Boolean'];
  /** Whether or not a user can perform `update_pages` on this resource */
  updatePages: Scalars['Boolean'];
  /** Whether or not a user can perform `update_wiki` on this resource */
  updateWiki: Scalars['Boolean'];
  /** Whether or not a user can perform `upload_file` on this resource */
  uploadFile: Scalars['Boolean'];
};

export type ProjectStatistics = {
  __typename?: 'ProjectStatistics';
  buildArtifactsSize: Scalars['Int'];
  commitCount: Scalars['Int'];
  lfsObjectsSize: Scalars['Int'];
  packagesSize: Scalars['Int'];
  repositorySize: Scalars['Int'];
  storageSize: Scalars['Int'];
  wikiSize?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  /** Testing endpoint to validate the API with */
  echo: Scalars['String'];
  /** Find a group */
  group?: Maybe<Group>;
  /** Metadata about GitLab */
  metadata?: Maybe<Metadata>;
  /** Find a namespace */
  namespace?: Maybe<Namespace>;
  /** Find a project */
  project?: Maybe<Project>;
};

export type QueryEchoArgs = {
  text?: Maybe<Scalars['String']>;
};

export type QueryGroupArgs = {
  fullPath: Scalars['ID'];
};

export type QueryNamespaceArgs = {
  fullPath: Scalars['ID'];
};

export type QueryProjectArgs = {
  fullPath: Scalars['ID'];
};

/** Autogenerated input type of RemoveAwardEmoji */
export type RemoveAwardEmojiInput = {
  /** The global id of the awardable resource */
  awardableId: Scalars['ID'];
  /** The emoji name */
  name: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
};

/** Autogenerated return type of RemoveAwardEmoji */
export type RemoveAwardEmojiPayload = {
  __typename?: 'RemoveAwardEmojiPayload';
  /** The award emoji after mutation */
  awardEmoji?: Maybe<AwardEmoji>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reasons why the mutation failed. */
  errors: Array<Scalars['String']>;
};

export type Repository = {
  __typename?: 'Repository';
  empty: Scalars['Boolean'];
  exists: Scalars['Boolean'];
  rootRef?: Maybe<Scalars['String']>;
  tree?: Maybe<Tree>;
};

export type RepositoryTreeArgs = {
  path: Scalars['String'];
  ref: Scalars['String'];
  recursive: Scalars['Boolean'];
};

export enum Sort {
  /** Updated at descending order */
  UpdatedDesc = 'updated_desc',
  /** Updated at ascending order */
  UpdatedAsc = 'updated_asc',
  /** Created at descending order */
  CreatedDesc = 'created_desc',
  /** Created at ascending order */
  CreatedAsc = 'created_asc'
}

export type Submodule = Entry & {
  __typename?: 'Submodule';
  flatPath: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  path: Scalars['String'];
  type: EntryType;
};

/** The connection type for Submodule. */
export type SubmoduleConnection = {
  __typename?: 'SubmoduleConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SubmoduleEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SubmoduleEdge = {
  __typename?: 'SubmoduleEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Submodule>;
};

/** Completion status of tasks */
export type TaskCompletionStatus = {
  __typename?: 'TaskCompletionStatus';
  completedCount: Scalars['Int'];
  count: Scalars['Int'];
};

/** Autogenerated input type of ToggleAwardEmoji */
export type ToggleAwardEmojiInput = {
  /** The global id of the awardable resource */
  awardableId: Scalars['ID'];
  /** The emoji name */
  name: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
};

/** Autogenerated return type of ToggleAwardEmoji */
export type ToggleAwardEmojiPayload = {
  __typename?: 'ToggleAwardEmojiPayload';
  /** The award emoji after mutation */
  awardEmoji?: Maybe<AwardEmoji>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Reasons why the mutation failed. */
  errors: Array<Scalars['String']>;
  /** True when the emoji was awarded, false when it was removed */
  toggledOn: Scalars['Boolean'];
};

export type Tree = {
  __typename?: 'Tree';
  blobs: BlobConnection;
  lastCommit?: Maybe<Commit>;
  submodules: SubmoduleConnection;
  trees: TreeEntryConnection;
};

export type TreeBlobsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type TreeSubmodulesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

export type TreeTreesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
};

/** Represents a directory */
export type TreeEntry = Entry & {
  __typename?: 'TreeEntry';
  flatPath: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  path: Scalars['String'];
  type: EntryType;
  webUrl?: Maybe<Scalars['String']>;
};

/** The connection type for TreeEntry. */
export type TreeEntryConnection = {
  __typename?: 'TreeEntryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TreeEntryEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TreeEntryEdge = {
  __typename?: 'TreeEntryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TreeEntry>;
};

export type User = {
  __typename?: 'User';
  avatarUrl: Scalars['String'];
  name: Scalars['String'];
  username: Scalars['String'];
  webUrl: Scalars['String'];
};

/** The connection type for User. */
export type UserConnection = {
  __typename?: 'UserConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type UserEdge = {
  __typename?: 'UserEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<User>;
};

export enum OpKind {
  mutation = 'mutation',
  query = 'query'
  // subscription = 'subscription', // TODO
}

export enum Actions {
  // 1
  // when a query fetch will be queued, use to handle loading states
  // this action is called for each query that will be added to a
  // batch of queries
  willQueue = 'willQueue',

  // 2 - never called if abort is called
  // when the fetch is started can be used to update requestConfig
  // to update loading state use willQueue, because initFetch
  // will be called only one time for a batch of queries
  initFetch = 'initFetch',

  // 2 or never
  // called when one query in a batch of queries is aborted, probably because
  // the query is already cached or have one identical query in progress
  abort = 'abort',

  // 3 - never called if aborted
  // called when fetch ends - called for a batch of queries, to handle
  // each query independently, you should listen to the 'complete' action
  completeFetch = 'completeFetch',

  // 4 - never called if aborted
  // called when one query is completed (but not aborted) - with success or not
  // to handle when a query completes even if the result comes from the cache,
  // you should listen to 'abort' too
  complete = 'complete'
}

export type Context<V = any, R = any> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V, R>;
  action: Actions;
  errors?: string[];
  result?: R | null;
  querySuffix?: string;
};

export type Middleware<V = any, R = any> = (
  config: Context<V, R>
) => Promise<Context<V, R>>;

export type FetcherConfig<V, R> = {
  url: string;
  headers?: { [key: string]: string };
  query: string;
  entityName?: string;
  schemaKey?: string;
  middleware?: Middleware<V, R>[] | Middleware<V, R>;
  fragment?: string;
  querySuffix?: string;
  cache?: boolean;
  kind: OpKind;
};

type Resolver = (r: ReturnType<Middleware<any>>) => void;

type QueueItem = {
  resolver: Resolver | null;
  variables: Dict;
  kind: 'mutation' | 'query';
  config: FetcherConfig<any, any>;
};

export type GraphQLClientConfig = {
  url?: string;
  middleware?: Middleware | Middleware[];
};

export class GraphQLClient {
  url = '/graphql';
  middleware: Middleware<any>[] = [];

  private queryBachTimeout!: any; //NodeJS.Timer;
  private mutationBachTimeout!: any; //NodeJS.Timer;

  private mutationQueue: QueueItem[] = [];
  private queryQueue: QueueItem[] = [];

  private queueLimit = 20;
  private timeoutLimit = 50;

  constructor(config: GraphQLClientConfig) {
    // apply global client instance middleware
    if (config.middleware) {
      const _instanceMiddleware = applyMiddleware(
        ensureArray(config.middleware)
      );

      this.middleware = [
        function instanceMiddleware(ctx: Context<any, any>) {
          return _instanceMiddleware(ctx);
        }
      ];
    }

    if (config.url) {
      this.url = config.url;
    }
  }

  private fetchQueue = (queue: QueueItem[], kind: OpKind) => {
    let batchMiddleware: Middleware<any>[] = [];
    let headers: Dict = {};
    let finalQueryBody = '';
    let finalQueryHeader = '';
    let finalVariables: Dict = {};
    let resolverMap: { [key: string]: QueueItem } = {};

    queue.forEach((childQuery, childQueryIndex) => {
      const qiKey = `${kind}_${childQueryIndex}`;
      let qiQuery = childQuery.config.query;

      resolverMap[qiKey] = childQuery;

      if (childQuery.config.middleware) {
        const m = ensureArray(childQuery.config.middleware);
        batchMiddleware = batchMiddleware.concat(m);
      }

      if (childQuery.config.middleware) {
        headers = { ...headers, ...childQuery.config.headers };
      }

      if (childQuery.variables) {
        Object.keys(childQuery.variables).forEach(k => {
          finalVariables[`${k}_${childQueryIndex}`] = childQuery.variables[k];
        });
      }

      // We will pass all batched queries in the body of one main query
      // The variables of the child queries will give new names in the
      // following format: "originalName" + "_" + childQueryIndex
      const firstQueryLine = qiQuery.trim().split('\n')[0];
      const variablesMatch = firstQueryLine.match(/\((.*)\)/);
      if (variablesMatch) {
        // if this child batched query has variables
        variablesMatch[1]
          .split(',')
          .map(pair =>
            pair
              .trim()
              .split(':') // will generate '["$varName", "GQLType"]
              .map(e => e.trim())
          )
          .forEach(pair => {
            const nname = `${pair[0]}_${childQueryIndex}`;
            finalQueryHeader += ` ${nname}: ${pair[1]} `;

            // regex to replace "$varName" with "$varName" + '_' + index
            // resulting in a varName like: "$varName_0"
            const reg = new RegExp('\\' + pair[0], 'mg');

            qiQuery = qiQuery.replace(reg, nname);
          });
      }

      finalQueryBody +=
        `\n ${qiKey}: ` +
        qiQuery
          .trim()
          .split('\n')
          .slice(1, -1) // remove query declaration line and closing tag
          .join('\n') +
        '\n';
    });

    if (finalQueryHeader) {
      // if this child query has variables
      finalQueryHeader = `(${finalQueryHeader})`;
    }

    const query = `${kind} ${finalQueryHeader} {
      ${finalQueryBody}
    }`;

    this.queryFetcher<any, any>(finalVariables, {
      url: this.url,
      query,
      middleware: batchMiddleware,
      kind
    }).then(ctx => {
      Object.keys(resolverMap).forEach(key => {
        const { resolver, config, variables } = resolverMap[key];
        if (!resolver) return;
        const middleware = applyMiddleware(ensureArray(config.middleware));

        resolver(
          middleware({
            ...ctx,
            result: ctx.result ? ctx.result[key] : null,
            action: Actions.complete,
            variables,
            config: config,
            querySuffix: key
          })
        );
      });
    });
  };

  exec = async <V, R>(
    _variables: V,
    _config: FetcherConfig<V, R>
  ): Promise<Context<V, R>> => {
    const { kind } = _config;

    if (kind !== OpKind.mutation && kind !== OpKind.query) {
      throw new Error(`invalid kind of operation: ${kind}`);
    }

    const config = {
      ..._config,
      url: this.url,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)]
    };

    const context = await applyMiddleware(config.middleware as [])({
      requestConfig: {},
      variables: _variables,
      config,
      action: Actions.willQueue
      // errors?: string[];
      // result?: R | null;
      // querySuffix?: string;
    });

    if (context.action === Actions.abort) {
      // applying middleware because listeners should be able
      // to listen to 'abort' action
      return applyMiddleware(config.middleware as [])(context);
    }

    let queueItem: QueueItem = {
      config: context.config,
      resolver: null,
      variables: _variables,
      kind
    };

    const promise = new Promise<Context<V, R>>(r => {
      queueItem.resolver = r;
    });

    if (kind === OpKind.query) {
      this.queryQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.queryQueue];
        this.queryQueue = [];
        this.fetchQueue(queue, kind);
      };

      clearTimeout(this.queryBachTimeout);
      this.queryBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.queryQueue.length >= this.queueLimit) {
        fulfill();
      }
    } else if (kind === OpKind.mutation) {
      this.mutationQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.mutationQueue];
        this.mutationQueue = [];
        this.fetchQueue(queue, kind);
      };

      clearTimeout(this.mutationBachTimeout);
      this.mutationBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.mutationQueue.length >= this.queueLimit) {
        fulfill();
      }
    }

    return promise;
  };

  methods: Methods = {
    echo: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'String',
        schemaKey: 'echo',
        query: query.echo(config ? config.fragment : undefined),
        kind: OpKind.query,
        ...config
      });
    },

    group: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'Group',
        schemaKey: 'group',
        query: query.group(config ? config.fragment : undefined),
        kind: OpKind.query,
        ...config
      });
    },

    metadata: ({}, config) => {
      return this.exec(
        {},
        {
          url: this.url,
          entityName: 'Metadata',
          schemaKey: 'metadata',
          query: query.metadata(config ? config.fragment : undefined),
          kind: OpKind.query,
          ...config
        }
      );
    },

    namespace: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'Namespace',
        schemaKey: 'namespace',
        query: query.namespace(config ? config.fragment : undefined),
        kind: OpKind.query,
        ...config
      });
    },

    project: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'Project',
        schemaKey: 'project',
        query: query.project(config ? config.fragment : undefined),
        kind: OpKind.query,
        ...config
      });
    },

    addAwardEmoji: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'AddAwardEmojiPayload',
        schemaKey: 'addAwardEmoji',
        query: query.addAwardEmoji(config ? config.fragment : undefined),
        kind: OpKind.mutation,
        ...config
      });
    },

    designManagementUpload: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'DesignManagementUploadPayload',
        schemaKey: 'designManagementUpload',
        query: query.designManagementUpload(
          config ? config.fragment : undefined
        ),
        kind: OpKind.mutation,
        ...config
      });
    },

    mergeRequestSetWip: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'MergeRequestSetWipPayload',
        schemaKey: 'mergeRequestSetWip',
        query: query.mergeRequestSetWip(config ? config.fragment : undefined),
        kind: OpKind.mutation,
        ...config
      });
    },

    removeAwardEmoji: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'RemoveAwardEmojiPayload',
        schemaKey: 'removeAwardEmoji',
        query: query.removeAwardEmoji(config ? config.fragment : undefined),
        kind: OpKind.mutation,
        ...config
      });
    },

    toggleAwardEmoji: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'ToggleAwardEmojiPayload',
        schemaKey: 'toggleAwardEmoji',
        query: query.toggleAwardEmoji(config ? config.fragment : undefined),
        kind: OpKind.mutation,
        ...config
      });
    }
  };

  methodsInfo: MethodsInfo = {
    echo: {
      type: 'String!',
      schemaKey: 'echo',
      entityName: 'String',
      isList: false,
      argsTSName: 'QueryEchoArgs',
      returnTSName: "Query['echo']",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: 'Testing endpoint to validate the API with',
        deprecationReason: null,
        type: 'String!',
        args: [{ name: 'text', description: null, type: 'String' }],
        isDeprecated: false,
        name: 'echo'
      },
      isNonNull: true,
      kind: 'query'
    },

    group: {
      type: 'Group',
      schemaKey: 'group',
      entityName: 'Group',
      isList: false,
      argsTSName: 'QueryGroupArgs',
      returnTSName: "Maybe<Query['group']>",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: 'Find a group',
        deprecationReason: null,
        type: 'Group',
        args: [
          {
            name: 'fullPath',
            description:
              'The full path of the project, group or namespace, e.g., "gitlab-org/gitlab-ce"',
            type: 'ID!'
          }
        ],
        isDeprecated: false,
        name: 'group'
      },
      isNonNull: false,
      kind: 'query'
    },

    metadata: {
      type: 'Metadata',
      schemaKey: 'metadata',
      entityName: 'Metadata',
      isList: false,
      argsTSName: '{}',
      returnTSName: "Maybe<Query['metadata']>",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: 'Metadata about GitLab',
        deprecationReason: null,
        type: 'Metadata',
        args: [],
        isDeprecated: false,
        name: 'metadata'
      },
      isNonNull: false,
      kind: 'query'
    },

    namespace: {
      type: 'Namespace',
      schemaKey: 'namespace',
      entityName: 'Namespace',
      isList: false,
      argsTSName: 'QueryNamespaceArgs',
      returnTSName: "Maybe<Query['namespace']>",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: 'Find a namespace',
        deprecationReason: null,
        type: 'Namespace',
        args: [
          {
            name: 'fullPath',
            description:
              'The full path of the project, group or namespace, e.g., "gitlab-org/gitlab-ce"',
            type: 'ID!'
          }
        ],
        isDeprecated: false,
        name: 'namespace'
      },
      isNonNull: false,
      kind: 'query'
    },

    project: {
      type: 'Project',
      schemaKey: 'project',
      entityName: 'Project',
      isList: false,
      argsTSName: 'QueryProjectArgs',
      returnTSName: "Maybe<Query['project']>",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: 'Find a project',
        deprecationReason: null,
        type: 'Project',
        args: [
          {
            name: 'fullPath',
            description:
              'The full path of the project, group or namespace, e.g., "gitlab-org/gitlab-ce"',
            type: 'ID!'
          }
        ],
        isDeprecated: false,
        name: 'project'
      },
      isNonNull: false,
      kind: 'query'
    },

    addAwardEmoji: {
      type: 'AddAwardEmojiPayload',
      schemaKey: 'addAwardEmoji',
      entityName: 'AddAwardEmojiPayload',
      isList: false,
      argsTSName: 'MutationAddAwardEmojiArgs',
      returnTSName: "Maybe<Mutation['addAwardEmoji']>",
      isMutation: true,
      isQuery: false,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'AddAwardEmojiPayload',
        args: [
          { name: 'input', description: null, type: 'AddAwardEmojiInput!' }
        ],
        isDeprecated: false,
        name: 'addAwardEmoji'
      },
      isNonNull: false,
      kind: 'mutation'
    },

    designManagementUpload: {
      type: 'DesignManagementUploadPayload',
      schemaKey: 'designManagementUpload',
      entityName: 'DesignManagementUploadPayload',
      isList: false,
      argsTSName: 'MutationDesignManagementUploadArgs',
      returnTSName: "Maybe<Mutation['designManagementUpload']>",
      isMutation: true,
      isQuery: false,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'DesignManagementUploadPayload',
        args: [
          {
            name: 'input',
            description: null,
            type: 'DesignManagementUploadInput!'
          }
        ],
        isDeprecated: false,
        name: 'designManagementUpload'
      },
      isNonNull: false,
      kind: 'mutation'
    },

    mergeRequestSetWip: {
      type: 'MergeRequestSetWipPayload',
      schemaKey: 'mergeRequestSetWip',
      entityName: 'MergeRequestSetWipPayload',
      isList: false,
      argsTSName: 'MutationMergeRequestSetWipArgs',
      returnTSName: "Maybe<Mutation['mergeRequestSetWip']>",
      isMutation: true,
      isQuery: false,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'MergeRequestSetWipPayload',
        args: [
          { name: 'input', description: null, type: 'MergeRequestSetWipInput!' }
        ],
        isDeprecated: false,
        name: 'mergeRequestSetWip'
      },
      isNonNull: false,
      kind: 'mutation'
    },

    removeAwardEmoji: {
      type: 'RemoveAwardEmojiPayload',
      schemaKey: 'removeAwardEmoji',
      entityName: 'RemoveAwardEmojiPayload',
      isList: false,
      argsTSName: 'MutationRemoveAwardEmojiArgs',
      returnTSName: "Maybe<Mutation['removeAwardEmoji']>",
      isMutation: true,
      isQuery: false,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'RemoveAwardEmojiPayload',
        args: [
          { name: 'input', description: null, type: 'RemoveAwardEmojiInput!' }
        ],
        isDeprecated: false,
        name: 'removeAwardEmoji'
      },
      isNonNull: false,
      kind: 'mutation'
    },

    toggleAwardEmoji: {
      type: 'ToggleAwardEmojiPayload',
      schemaKey: 'toggleAwardEmoji',
      entityName: 'ToggleAwardEmojiPayload',
      isList: false,
      argsTSName: 'MutationToggleAwardEmojiArgs',
      returnTSName: "Maybe<Mutation['toggleAwardEmoji']>",
      isMutation: true,
      isQuery: false,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'ToggleAwardEmojiPayload',
        args: [
          { name: 'input', description: null, type: 'ToggleAwardEmojiInput!' }
        ],
        isDeprecated: false,
        name: 'toggleAwardEmoji'
      },
      isNonNull: false,
      kind: 'mutation'
    }
  };

  queryFetcher = async <Variables, Return>(
    variables: Variables,
    config: FetcherConfig<Variables, Return>
  ): Promise<Context<Variables, Return>> => {
    let requestConfig: RequestInit = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers
      }
    };

    const middleware: Middleware<Variables, Return> =
      typeof config.middleware === 'function'
        ? config.middleware
        : applyMiddleware(ensureArray(config.middleware));

    const context = await middleware({
      requestConfig,
      variables,
      config,
      action: Actions.initFetch,
      querySuffix: config.querySuffix
    });

    if (context.action === Actions.abort) {
      return context;
    }

    context.requestConfig.body = JSON.stringify({
      query: context.config.query,
      variables: context.variables
    });

    return fetch(context.config.url, context.requestConfig)
      .then(async response => {
        const contentType = response.headers.get('Content-Type');
        const isJSON =
          contentType && contentType.startsWith('application/json');

        if (!isJSON) {
          const fetchError = await response.text();

          return middleware({
            ...context,
            result: null,
            action: Actions.completeFetch,
            errors: [fetchError]
          });
        }

        let { errors, data } = await response.json();

        if (errors && !Array.isArray(errors)) {
          errors = [errors];
        }

        if (errors) {
          errors = errors.map((e: any) =>
            e && e.message ? e.message : JSON.stringify(e)
          );
        }

        return middleware({
          ...context,
          errors,
          action: Actions.completeFetch,
          result: data
            ? config.schemaKey
              ? data[config.schemaKey]
              : data
            : null
        });
      })
      .catch(err => {
        return middleware({
          ...context,
          errors: [err],
          action: Actions.completeFetch,
          result: null
        });
      });
  };
}

// compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
function compose(funcs: Middleware<any>[]) {
  if (!Array.isArray(funcs) || funcs.length === 0) {
    return (arg => Promise.resolve(arg)) as Middleware<any>;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => async context => {
    return await a(await b(context));
    // return await a(await b(cloneDeep(context)));
  });
}

export const applyMiddleware = <V = any>(
  middleware: Middleware<V>[]
): Middleware<V> => {
  return (context: Context<V>) => {
    return compose(middleware)(context);
  };
};

export function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}

export type Dict<T = any> = { [key: string]: T };

export type Method<
  Variables = any,
  ReturnType = any,
  Config = Partial<FetcherConfig<Variables, ReturnType | undefined | null>>
> = (
  variables: Variables,
  config?: Config
) => Promise<Context<Variables, ReturnType | undefined | null>>;

type MethodsDict = { [key: string]: Method };

export interface Methods extends MethodsDict {
  echo: Method<QueryEchoArgs, Query['echo']>;

  group: Method<QueryGroupArgs, Maybe<Query['group']>>;

  metadata: Method<{}, Maybe<Query['metadata']>>;

  namespace: Method<QueryNamespaceArgs, Maybe<Query['namespace']>>;

  project: Method<QueryProjectArgs, Maybe<Query['project']>>;

  addAwardEmoji: Method<
    MutationAddAwardEmojiArgs,
    Maybe<Mutation['addAwardEmoji']>
  >;

  designManagementUpload: Method<
    MutationDesignManagementUploadArgs,
    Maybe<Mutation['designManagementUpload']>
  >;

  mergeRequestSetWip: Method<
    MutationMergeRequestSetWipArgs,
    Maybe<Mutation['mergeRequestSetWip']>
  >;

  removeAwardEmoji: Method<
    MutationRemoveAwardEmojiArgs,
    Maybe<Mutation['removeAwardEmoji']>
  >;

  toggleAwardEmoji: Method<
    MutationToggleAwardEmojiArgs,
    Maybe<Mutation['toggleAwardEmoji']>
  >;
}

export type MethodsInfo = {
  [key: string]: MethodInfo;
};

export interface MethodInfo {
  type: string;
  schemaKey: keyof Methods;
  entityName: string;
  isList: boolean;
  argsTSName: string;
  returnTSName: string;
  isMutation: boolean;
  isQuery: boolean;
  isSubscription: boolean;
  field: any;
  isNonNull: boolean;
  kind: OpKind | string;
}

export interface ArgsEntity {
  name: string;
  description?: string | null;
  type: string;
  [key: string]: any;
}

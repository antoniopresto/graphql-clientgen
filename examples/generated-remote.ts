export const query = {
  echo: (fragment = '') => `
        query echo($text: String){
                ${fragment ||
                  `
                    echo(text: $text)
                `}
        }`,

  group: (fragment = '') => `
        query group($full: Boolean, $full1: Boolean, $iid: ID, $iids: [ID!], $first: Int, $after: String, $last: Int, $before: String, $iid1: ID, $iids1: [ID!], $full2: Boolean, $iid2: ID, $iids2: [ID!], $first1: Int, $after1: String, $last1: Int, $before1: String, $includeSubgroups: Boolean, $fullPath: ID!){
            group(fullPath: $fullPath){
                ${fragment ||
                  `
                        avatarUrl
                        description
                        epic(iid: $iid, iids: $iids){
                            author{
                                avatarUrl
                                name
                                username
                                webUrl
                            }
                            closedAt
                            createdAt
                            description
                            dueDate
                            dueDateFixed
                            dueDateFromMilestones
                            dueDateIsFixed
                            group{
                                avatarUrl
                                description
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
                            }
                            hasChildren
                            hasIssues
                            id
                            iid
                            parent{
                                closedAt
                                createdAt
                                description
                                dueDate
                                dueDateFixed
                                dueDateFromMilestones
                                dueDateIsFixed
                                hasChildren
                                hasIssues
                                id
                                iid
                                reference(full: $full)
                                relationPath
                                startDate
                                startDateFixed
                                startDateFromMilestones
                                startDateIsFixed
                                state
                                title
                                updatedAt
                                webPath
                                webUrl
                            }
                            reference(full: $full1)
                            relationPath
                            startDate
                            startDateFixed
                            startDateFromMilestones
                            startDateIsFixed
                            state
                            title
                            updatedAt
                            userPermissions{
                                adminEpic
                                awardEmoji
                                createEpic
                                createNote
                                destroyEpic
                                readEpic
                                readEpicIid
                                updateEpic
                            }
                            webPath
                            webUrl
                        }
                        epics(first: $first, after: $after, last: $last, before: $before, iid: $iid1, iids: $iids1){
                            edges{
                                cursor
                            }
                            pageInfo{
                                endCursor
                                hasNextPage
                                hasPreviousPage
                                startCursor
                            }
                        }
                        epicsEnabled
                        fullName
                        fullPath
                        id
                        lfsEnabled
                        name
                        parent{
                            avatarUrl
                            description
                            epic(iid: $iid2, iids: $iids2){
                                closedAt
                                createdAt
                                description
                                dueDate
                                dueDateFixed
                                dueDateFromMilestones
                                dueDateIsFixed
                                hasChildren
                                hasIssues
                                id
                                iid
                                reference(full: $full2)
                                relationPath
                                startDate
                                startDateFixed
                                startDateFromMilestones
                                startDateIsFixed
                                state
                                title
                                updatedAt
                                webPath
                                webUrl
                            }
                            epicsEnabled
                            fullName
                            fullPath
                            id
                            lfsEnabled
                            name
                            parent{
                                avatarUrl
                                description
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
                            }
                            path
                            requestAccessEnabled
                            userPermissions{
                                readGroup
                            }
                            visibility
                            webUrl
                        }
                        path
                        projects(first: $first1, after: $after1, last: $last1, before: $before1, includeSubgroups: $includeSubgroups){
                            edges{
                                cursor
                            }
                            pageInfo{
                                endCursor
                                hasNextPage
                                hasPreviousPage
                                startCursor
                            }
                        }
                        requestAccessEnabled
                        userPermissions{
                            readGroup
                        }
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
        query namespace($first: Int, $after: String, $last: Int, $before: String, $includeSubgroups: Boolean, $fullPath: ID!){
            namespace(fullPath: $fullPath){
                ${fragment ||
                  `
                        description
                        fullName
                        fullPath
                        id
                        lfsEnabled
                        name
                        path
                        projects(first: $first, after: $after, last: $last, before: $before, includeSubgroups: $includeSubgroups){
                            edges{
                                cursor
                            }
                            pageInfo{
                                endCursor
                                hasNextPage
                                hasPreviousPage
                                startCursor
                            }
                        }
                        requestAccessEnabled
                        visibility
                `}
            }
        }`,

  project: (fragment = '') => `
        query project($full: Boolean, $iid: ID, $iids: [ID!], $full1: Boolean, $iid1: String, $iids1: [String!], $state: IssuableState, $labelName: [String], $createdBefore: Time, $createdAfter: Time, $updatedBefore: Time, $updatedAfter: Time, $closedBefore: Time, $closedAfter: Time, $search: String, $sort: Sort, $first: Int, $after: String, $last: Int, $before: String, $iid2: String, $iids2: [String!], $state1: IssuableState, $labelName1: [String], $createdBefore1: Time, $createdAfter1: Time, $updatedBefore1: Time, $updatedAfter1: Time, $closedBefore1: Time, $closedAfter1: Time, $search1: String, $sort1: Sort, $iid3: String, $iids3: [String!], $first1: Int, $after1: String, $last1: Int, $before1: String, $iid4: String, $iids4: [String!], $first2: Int, $after2: String, $last2: Int, $before2: String, $status: PipelineStatusEnum, $ref: String, $sha: String, $fullPath: ID!){
            project(fullPath: $fullPath){
                ${fragment ||
                  `
                        archived
                        avatarUrl
                        containerRegistryEnabled
                        createdAt
                        description
                        forksCount
                        fullPath
                        group{
                            avatarUrl
                            description
                            epic(iid: $iid, iids: $iids){
                                closedAt
                                createdAt
                                description
                                dueDate
                                dueDateFixed
                                dueDateFromMilestones
                                dueDateIsFixed
                                hasChildren
                                hasIssues
                                id
                                iid
                                reference(full: $full)
                                relationPath
                                startDate
                                startDateFixed
                                startDateFromMilestones
                                startDateIsFixed
                                state
                                title
                                updatedAt
                                webPath
                                webUrl
                            }
                            epicsEnabled
                            fullName
                            fullPath
                            id
                            lfsEnabled
                            name
                            parent{
                                avatarUrl
                                description
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
                            }
                            path
                            requestAccessEnabled
                            userPermissions{
                                readGroup
                            }
                            visibility
                            webUrl
                        }
                        httpUrlToRepo
                        id
                        importStatus
                        issue(iid: $iid1, iids: $iids1, state: $state, labelName: $labelName, createdBefore: $createdBefore, createdAfter: $createdAfter, updatedBefore: $updatedBefore, updatedAfter: $updatedAfter, closedBefore: $closedBefore, closedAfter: $closedAfter, search: $search, sort: $sort){
                            author{
                                avatarUrl
                                name
                                username
                                webUrl
                            }
                            closedAt
                            confidential
                            createdAt
                            description
                            discussionLocked
                            downvotes
                            dueDate
                            iid
                            milestone{
                                createdAt
                                description
                                dueDate
                                startDate
                                state
                                title
                                updatedAt
                            }
                            reference(full: $full1)
                            relativePosition
                            state
                            taskCompletionStatus{
                                completedCount
                                count
                            }
                            title
                            updatedAt
                            upvotes
                            userNotesCount
                            userPermissions{
                                adminIssue
                                createDesign
                                createNote
                                destroyDesign
                                readDesign
                                readIssue
                                reopenIssue
                                updateIssue
                            }
                            webPath
                            webUrl
                            weight
                        }
                        issues(first: $first, after: $after, last: $last, before: $before, iid: $iid2, iids: $iids2, state: $state1, labelName: $labelName1, createdBefore: $createdBefore1, createdAfter: $createdAfter1, updatedBefore: $updatedBefore1, updatedAfter: $updatedAfter1, closedBefore: $closedBefore1, closedAfter: $closedAfter1, search: $search1, sort: $sort1){
                            edges{
                                cursor
                            }
                            pageInfo{
                                endCursor
                                hasNextPage
                                hasPreviousPage
                                startCursor
                            }
                        }
                        issuesEnabled
                        jobsEnabled
                        lastActivityAt
                        lfsEnabled
                        mergeRequest(iid: $iid3, iids: $iids3){
                            allowCollaboration
                            createdAt
                            defaultMergeCommitMessage
                            description
                            diffHeadSha
                            downvotes
                            forceRemoveSourceBranch
                            headPipeline{
                                beforeSha
                                committedAt
                                coverage
                                createdAt
                                duration
                                finishedAt
                                id
                                iid
                                sha
                                startedAt
                                status
                                updatedAt
                            }
                            id
                            iid
                            inProgressMergeCommitSha
                            mergeCommitSha
                            mergeError
                            mergeOngoing
                            mergeStatus
                            mergeWhenPipelineSucceeds
                            mergeableDiscussionsState
                            project{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                            projectId
                            rebaseCommitSha
                            rebaseInProgress
                            shouldBeRebased
                            shouldRemoveSourceBranch
                            sourceBranch
                            sourceBranchExists
                            sourceProject{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                            sourceProjectId
                            state
                            subscribed
                            targetBranch
                            targetProject{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                            targetProjectId
                            taskCompletionStatus{
                                completedCount
                                count
                            }
                            title
                            updatedAt
                            upvotes
                            userNotesCount
                            userPermissions{
                                adminMergeRequest
                                cherryPickOnCurrentMergeRequest
                                createNote
                                pushToSourceBranch
                                readMergeRequest
                                removeSourceBranch
                                revertOnCurrentMergeRequest
                                updateMergeRequest
                            }
                            webUrl
                            workInProgress
                        }
                        mergeRequests(first: $first1, after: $after1, last: $last1, before: $before1, iid: $iid4, iids: $iids4){
                            edges{
                                cursor
                            }
                            pageInfo{
                                endCursor
                                hasNextPage
                                hasPreviousPage
                                startCursor
                            }
                        }
                        mergeRequestsEnabled
                        mergeRequestsFfOnlyEnabled
                        name
                        nameWithNamespace
                        namespace{
                            description
                            fullName
                            fullPath
                            id
                            lfsEnabled
                            name
                            path
                            requestAccessEnabled
                            visibility
                        }
                        onlyAllowMergeIfAllDiscussionsAreResolved
                        onlyAllowMergeIfPipelineSucceeds
                        openIssuesCount
                        path
                        pipelines(first: $first2, after: $after2, last: $last2, before: $before2, status: $status, ref: $ref, sha: $sha){
                            edges{
                                cursor
                            }
                            pageInfo{
                                endCursor
                                hasNextPage
                                hasPreviousPage
                                startCursor
                            }
                        }
                        printingMergeRequestLinkEnabled
                        publicJobs
                        repository{
                            empty
                            exists
                            rootRef
                        }
                        requestAccessEnabled
                        sharedRunnersEnabled
                        snippetsEnabled
                        sshUrlToRepo
                        starCount
                        statistics{
                            buildArtifactsSize
                            commitCount
                            lfsObjectsSize
                            packagesSize
                            repositorySize
                            storageSize
                            wikiSize
                        }
                        tagList
                        userPermissions{
                            adminProject
                            adminRemoteMirror
                            adminWiki
                            archiveProject
                            changeNamespace
                            changeVisibilityLevel
                            createDeployment
                            createDesign
                            createIssue
                            createLabel
                            createMergeRequestFrom
                            createMergeRequestIn
                            createPages
                            createPipeline
                            createPipelineSchedule
                            createProjectSnippet
                            createWiki
                            destroyDesign
                            destroyPages
                            destroyWiki
                            downloadCode
                            downloadWikiCode
                            forkProject
                            pushCode
                            pushToDeleteProtectedBranch
                            readCommitStatus
                            readCycleAnalytics
                            readDesign
                            readPagesContent
                            readProject
                            readProjectMember
                            readWiki
                            removeForkProject
                            removePages
                            removeProject
                            renameProject
                            requestAccess
                            updatePages
                            updateWiki
                            uploadFile
                        }
                        visibility
                        webUrl
                        wikiEnabled
                `}
            }
        }`,

  designManagementUpload: (fragment = '') => `
        mutation designManagementUpload($full: Boolean, $input: DesignManagementUploadInput!){
            designManagementUpload(input: $input){
                ${fragment ||
                  `
                        clientMutationId
                        designs{
                            filename
                            id
                            image
                            issue{
                                closedAt
                                confidential
                                createdAt
                                description
                                discussionLocked
                                downvotes
                                dueDate
                                iid
                                reference(full: $full)
                                relativePosition
                                state
                                title
                                updatedAt
                                upvotes
                                userNotesCount
                                webPath
                                webUrl
                                weight
                            }
                            project{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                        }
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
                        mergeRequest{
                            allowCollaboration
                            createdAt
                            defaultMergeCommitMessage
                            description
                            diffHeadSha
                            downvotes
                            forceRemoveSourceBranch
                            headPipeline{
                                beforeSha
                                committedAt
                                coverage
                                createdAt
                                duration
                                finishedAt
                                id
                                iid
                                sha
                                startedAt
                                status
                                updatedAt
                            }
                            id
                            iid
                            inProgressMergeCommitSha
                            mergeCommitSha
                            mergeError
                            mergeOngoing
                            mergeStatus
                            mergeWhenPipelineSucceeds
                            mergeableDiscussionsState
                            project{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                            projectId
                            rebaseCommitSha
                            rebaseInProgress
                            shouldBeRebased
                            shouldRemoveSourceBranch
                            sourceBranch
                            sourceBranchExists
                            sourceProject{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                            sourceProjectId
                            state
                            subscribed
                            targetBranch
                            targetProject{
                                archived
                                avatarUrl
                                containerRegistryEnabled
                                createdAt
                                description
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
                            }
                            targetProjectId
                            taskCompletionStatus{
                                completedCount
                                count
                            }
                            title
                            updatedAt
                            upvotes
                            userNotesCount
                            userPermissions{
                                adminMergeRequest
                                cherryPickOnCurrentMergeRequest
                                createNote
                                pushToSourceBranch
                                readMergeRequest
                                removeSourceBranch
                                revertOnCurrentMergeRequest
                                updateMergeRequest
                            }
                            webUrl
                            workInProgress
                        }
                `}
            }
        }`
};

export type Maybe<T> = T | null;
export type MaybePromise<T> = Promise<T> | T;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Time represented in ISO 8601 */
  Time: any;
  Upload: any;
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
  full?: Maybe<Scalars['Boolean']>;
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
  full?: Maybe<Scalars['Boolean']>;
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
  includeSubgroups?: Maybe<Scalars['Boolean']>;
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
  full?: Maybe<Scalars['Boolean']>;
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
  designManagementUpload?: Maybe<DesignManagementUploadPayload>;
  mergeRequestSetWip?: Maybe<MergeRequestSetWipPayload>;
};

export type MutationDesignManagementUploadArgs = {
  input: DesignManagementUploadInput;
};

export type MutationMergeRequestSetWipArgs = {
  input: MergeRequestSetWipInput;
};

export type Namespace = {
  __typename?: 'Namespace';
  description?: Maybe<Scalars['String']>;
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
  includeSubgroups?: Maybe<Scalars['Boolean']>;
};

export type Note = {
  __typename?: 'Note';
  /** The user who wrote this note */
  author: User;
  /** The content note itself */
  body: Scalars['String'];
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
  namespace: Namespace;
  onlyAllowMergeIfAllDiscussionsAreResolved?: Maybe<Scalars['Boolean']>;
  onlyAllowMergeIfPipelineSucceeds?: Maybe<Scalars['Boolean']>;
  openIssuesCount?: Maybe<Scalars['Int']>;
  path: Scalars['String'];
  pipelines?: Maybe<PipelineConnection>;
  printingMergeRequestLinkEnabled?: Maybe<Scalars['Boolean']>;
  publicJobs?: Maybe<Scalars['Boolean']>;
  repository: Repository;
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
  sort?: Maybe<Sort>;
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
  sort?: Maybe<Sort>;
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

export type Repository = {
  __typename?: 'Repository';
  empty: Scalars['Boolean'];
  exists: Scalars['Boolean'];
  rootRef?: Maybe<Scalars['String']>;
  tree?: Maybe<Tree>;
};

export type RepositoryTreeArgs = {
  path?: Maybe<Scalars['String']>;
  ref?: Maybe<Scalars['String']>;
  recursive?: Maybe<Scalars['Boolean']>;
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

export type Tree = {
  __typename?: 'Tree';
  blobs: BlobConnection;
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

export enum Actions {
  init = 'init',
  complete = 'complete'
}

type Context<V, R = any> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V, R>;
  action: Actions;
  errors?: string[];
  result?: R | null;
};

type Middleware<V = any, R = any> = (config: Context<V, R>) => Context<V, R>;

export type FetcherConfig<V, R> = {
  url: string;
  headers?: { [key: string]: string };
  query: string;
  entityName?: string;
  schemaKey?: string;
  middleware?: Middleware<V, R>[] | Middleware<V, R>;
  fragment?: string;
};

const queryFetcher = async function queryFetcher<Variables, Return>(
  variables: Variables,
  config: FetcherConfig<Variables, Return>
): Promise<Context<Variables, Return>> {
  let requestConfig: RequestInit = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers
    }
  };

  const middleware: Middleware<Variables, Return> = config.middleware
    ? applyMiddleware(ensureArray(config.middleware))
    : ctx => ctx;

  const context = middleware({
    requestConfig,
    variables,
    config,
    action: Actions.init
  });

  context.requestConfig.body = JSON.stringify({
    query: context.config.query,
    variables: context.variables
  });

  return fetch(context.config.url, context.requestConfig).then(
    async response => {
      const contentType = response.headers.get('Content-Type');
      const isJSON = contentType && contentType.startsWith('application/json');

      if (!isJSON) {
        const fetchError = await response.text();

        return middleware({
          ...context,
          result: null,
          action: Actions.complete,
          errors: [fetchError]
        });
      }

      let { errors, data } = await response.json();

      return middleware({
        ...context,
        errors,
        action: Actions.complete,
        result: data ? (config.schemaKey ? data[config.schemaKey] : data) : null
      });
    }
  );
};

export type QueryFetcher = typeof queryFetcher;

type Resolver = (r: Context<any, any>) => void;
type QueueItem = FetcherConfig<any, any> & {
  resolver: Resolver | null;
  variables: Dict;
  kind: 'mutation' | 'query';
};

export class GraphQLClient {
  private url = '/graphql';
  private middleware: Middleware<any>[];

  private queryBachTimeout!: any; //NodeJS.Timer;
  private mutationBachTimeout!: any; //NodeJS.Timer;

  private mutationQueue: QueueItem[] = [];
  private queryQueue: QueueItem[] = [];

  private queueLimit = 20;
  private timeoutLimit = 50;

  constructor(config: {
    url?: string;
    middleware?: Middleware | Middleware[];
  }) {
    this.middleware = ensureArray(config.middleware);

    if (config.url) {
      this.url = config.url;
    }
  }

  private fetchQueue = (queue: QueueItem[], kind: 'mutation' | 'query') => {
    let middleware: any[] = [];
    let headers: Dict = {};
    let finalQueryBody = '';
    let finalQueryHeader = '';
    let finalVariables: Dict = {};
    let resolverMap: { [key: string]: QueueItem } = {};

    queue.forEach((q, key) => {
      const qiKey = `${kind}_${key}`;
      let qiQuery = q.query;
      const qiHeader = getHeader(qiQuery.trim().split('\n')[0]);
      resolverMap[qiKey] = q;

      if (q.middleware) {
        middleware = middleware.concat(ensureArray(q.middleware));
      }

      if (q.headers) {
        headers = { ...headers, ...q.headers };
      }

      if (q.variables) {
        Object.keys(q.variables).forEach(k => {
          finalVariables[`${k}_${key}`] = q.variables[k];
        });
      }

      qiHeader.forEach(pair => {
        const nname = `${pair[0]}_${key}`;
        finalQueryHeader += ` ${nname}: ${pair[1]} `;

        const reg = new RegExp('\\' + pair[0], 'mg');

        qiQuery = qiQuery.replace(reg, nname);
      });

      finalQueryBody +=
        `\n ${qiKey}: ` +
        qiQuery
          .trim()
          .split('\n')
          .slice(1, -1) // remove query declaration line and closing tag
          .join('\n') +
        '\n';
    });

    const query = `${kind} (${finalQueryHeader}) {
      ${finalQueryBody}
    }`;

    queryFetcher<any, any>(finalVariables, {
      url: this.url,
      query
    }).then(ctx => {
      if (ctx.result) {
        Object.keys(resolverMap).forEach(key => {
          const { resolver } = resolverMap[key];
          if (!resolver) return;
          resolver({ ...ctx, result: ctx.result[key] });
        });
      }
    });
  };

  exec = <V, R>(_variables: V, _config: FetcherConfig<V, R>) => {
    const kind = _config.query.trim().startsWith('query')
      ? 'query'
      : 'mutation';

    const queueItem: QueueItem = {
      url: this.url,
      ..._config,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)],
      resolver: null,
      variables: _variables,
      kind
    };

    const promise = new Promise<Context<V, R>>(r => {
      queueItem.resolver = r;
    });

    if (kind === 'query') {
      this.queryQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.queryQueue];
        this.queryQueue = [];
        this.fetchQueue(queue, 'query');
      };

      clearTimeout(this.queryBachTimeout);
      this.queryBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.queryQueue.length >= this.queueLimit) {
        fulfill();
      }
    } else {
      this.mutationQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.mutationQueue];
        this.mutationQueue = [];
        this.fetchQueue(queue, 'mutation');
      };

      clearTimeout(this.mutationBachTimeout);
      this.mutationBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.mutationQueue.length >= this.queueLimit) {
        fulfill();
      }
    }

    return promise;
  };

  client = {
    echo: (
      variables: QueryEchoArgs,
      config: Partial<FetcherConfig<QueryEchoArgs, Query['echo']>> = {}
    ) => {
      return this.exec<QueryEchoArgs, Query['echo']>(variables, {
        url: this.url,
        entityName: 'String',
        schemaKey: 'echo',
        query: query.echo(config.fragment),
        ...config
      });
    },

    group: (
      variables: QueryGroupArgs,
      config: Partial<FetcherConfig<QueryGroupArgs, Maybe<Query['group']>>> = {}
    ) => {
      return this.exec<QueryGroupArgs, Maybe<Query['group']>>(variables, {
        url: this.url,
        entityName: 'Group',
        schemaKey: 'group',
        query: query.group(config.fragment),
        ...config
      });
    },

    metadata: (
      config: Partial<FetcherConfig<{}, Maybe<Query['metadata']>>> = {}
    ) => {
      return this.exec<{}, Maybe<Query['metadata']>>(
        {},
        {
          url: this.url,
          entityName: 'Metadata',
          schemaKey: 'metadata',
          query: query.metadata(config.fragment),
          ...config
        }
      );
    },

    namespace: (
      variables: QueryNamespaceArgs,
      config: Partial<
        FetcherConfig<QueryNamespaceArgs, Maybe<Query['namespace']>>
      > = {}
    ) => {
      return this.exec<QueryNamespaceArgs, Maybe<Query['namespace']>>(
        variables,
        {
          url: this.url,
          entityName: 'Namespace',
          schemaKey: 'namespace',
          query: query.namespace(config.fragment),
          ...config
        }
      );
    },

    project: (
      variables: QueryProjectArgs,
      config: Partial<
        FetcherConfig<QueryProjectArgs, Maybe<Query['project']>>
      > = {}
    ) => {
      return this.exec<QueryProjectArgs, Maybe<Query['project']>>(variables, {
        url: this.url,
        entityName: 'Project',
        schemaKey: 'project',
        query: query.project(config.fragment),
        ...config
      });
    },

    designManagementUpload: (
      variables: MutationDesignManagementUploadArgs,
      config: Partial<
        FetcherConfig<
          MutationDesignManagementUploadArgs,
          Maybe<Mutation['designManagementUpload']>
        >
      > = {}
    ) => {
      return this.exec<
        MutationDesignManagementUploadArgs,
        Maybe<Mutation['designManagementUpload']>
      >(variables, {
        url: this.url,
        entityName: 'DesignManagementUploadPayload',
        schemaKey: 'designManagementUpload',
        query: query.designManagementUpload(config.fragment),
        ...config
      });
    },

    mergeRequestSetWip: (
      variables: MutationMergeRequestSetWipArgs,
      config: Partial<
        FetcherConfig<
          MutationMergeRequestSetWipArgs,
          Maybe<Mutation['mergeRequestSetWip']>
        >
      > = {}
    ) => {
      return this.exec<
        MutationMergeRequestSetWipArgs,
        Maybe<Mutation['mergeRequestSetWip']>
      >(variables, {
        url: this.url,
        entityName: 'MergeRequestSetWipPayload',
        schemaKey: 'mergeRequestSetWip',
        query: query.mergeRequestSetWip(config.fragment),
        ...config
      });
    }
  };
}

// compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
function compose(...funcs: Middleware<any>[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const applyMiddleware = <V = any>(
  middleware: Middleware<V>[]
): Middleware<V> => {
  return (context: Context<V>) => {
    return compose(...middleware)(context);
  };
};

function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}

// => [['$varname', 'GqlInputType'], ...]
function getHeader(str: string) {
  return ((str.match(/\((.*)\)/) || [])[1] || '').split(',').map(pair =>
    pair
      .trim()
      .split(':')
      .map(e => e.trim())
  );
}

type Dict = { [key: string]: any };

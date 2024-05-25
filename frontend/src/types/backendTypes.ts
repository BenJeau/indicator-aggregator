/*
 Generated by typeshare 1.7.0
*/

/** Cache key, consisting of a list of strings, used for cache hits and invalidations */
export type CacheKey = string[];

/** A cache entry, encapsulating the value and the timestamp of when it was created */
export interface CacheEntry<T> {
  /** Timestamp of when the cache entry was created */
  timestamp: NaiveDateTime;
  /** The actual value of the cache entry */
  value: T;
  /** The timespan after which the cache entry will be invalidated, if any */
  expiration?: number;
}

/** An token used for authentication with the API */
export interface ApiToken {
  /** The database ID of the token */
  id: string;
  /** The time the token was created */
  createdAt: NaiveDateTime;
  /** The time the token was last updated */
  updatedAt: NaiveDateTime;
  /** A description of the token */
  note: string;
  /** The time the token expires */
  expiresAt?: NaiveDateTime;
}

/** Parameters for creating a new API token */
export interface CreateApiToken {
  /** A description of the token */
  note: string;
  /** The time the token expires */
  expiresAt?: NaiveDateTime;
}

/** Parameters for updating an API token */
export interface UpdateApiToken {
  /** A description of the token */
  note?: string;
  /** The time the token expires */
  expiresAt?: NaiveDateTime;
}

/** List of indicators to ignore when processing requests against sources */
export interface IgnoreList {
  /** Database ID of the ignore list */
  id: string;
  /** Timestamp of when the ignore list was created */
  createdAt: NaiveDateTime;
  /** Timestamp of when the ignore list was last updated */
  updatedAt: NaiveDateTime;
  /** Name of the ignore list */
  name: string;
  /** URL friendly name of the ignore list */
  slug: string;
  /** Description of the ignore list */
  description: string;
  /** Whether the ignore list is enabled and used to ignore certain requests */
  enabled: boolean;
  /** Whether the ignore list is global and used to ignore all requests, regardless of it's source */
  global: boolean;
}

/** Parameters for creating a new ignore list */
export interface CreateIgnoreList {
  /** Name of the ignore list */
  name: string;
  /** Description of the ignore list */
  description: string;
  /** Whether the ignore list is enabled and used to ignore certain requests */
  enabled: boolean;
  /** Whether the ignore list is global and used to ignore all requests, regardless of it's source */
  global: boolean;
}

/** Parameters for updating an ignore list */
export interface UpdateIgnoreList {
  /** Name of the ignore list */
  name?: string;
  /** Description of the ignore list */
  description?: string;
  /** Whether the ignore list is enabled and used to ignore certain requests */
  enabled?: boolean;
  /** Whether the ignore list is global and used to ignore all requests, regardless of it's source */
  global?: boolean;
}

/** Entry in an ignore list */
export interface IgnoreListEntry {
  /** Database ID of the ignore list entry */
  id: string;
  /** Timestamp of when the ignore list entry was created */
  createdAt: NaiveDateTime;
  /** Timestamp of when the ignore list entry was last updated */
  updatedAt: NaiveDateTime;
  /** Data of the indicator to ignore */
  data: string;
  /** Kind of the indicator to ignore */
  indicatorKind: string;
  /** Database ID of the ignore list the entry belongs to */
  ignoreListId: string;
}

/** Parameters for creating a new ignore list entry */
export interface CreateIngoreListEntry {
  /** Data of the indicator to ignore */
  data: string;
  /** Kind of the indicator to ignore */
  indicatorKind: string;
}

/** Kind of the indicator */
export enum IndicatorKind {
  Domain = "DOMAIN",
  Ipv4 = "IPV4",
  Ipv6 = "IPV6",
  Url = "URL",
  Email = "EMAIL",
  Sha1 = "SHA1",
  Sha256 = "SHA256",
  Sha512 = "SHA512",
  Md5 = "MD5",
  Tlsh = "TLSH",
  Ssdeep = "SSDEEP",
}

/** An indicator of compromise, containing the data and its kind */
export interface Indicator {
  /** Data of the indicator */
  data: string;
  /** Kind of the indicator */
  kind: IndicatorKind;
}

/** Database ID and URL friendly name */
export interface IdSlug {
  /** Database ID */
  id: string;
  /** URL friendly name */
  slug: string;
}

/** A source with minimal information needed for displaying the notification */
export interface MinimalSource {
  /** Database ID of the source */
  id: string;
  /** Name of the source */
  name: string;
  /** URL friendly name of the provider */
  slug: string;
  /** Number of secrets needed for the source */
  numMissingSecrets: number;
}

/** Source provider, organization or service that provides indicators with the number of sources it has */
export interface Provider {
  /** Database ID of the provider */
  id: string;
  /** Timestamp of the creation of the provider */
  createdAt: NaiveDateTime;
  /** Timestamp of the last update of the provider */
  updatedAt: NaiveDateTime;
  /** Name of the provider */
  name: string;
  /** URL friendly name of the provider */
  slug: string;
  /** Description of the provider */
  description: string;
  /** Documentation URL of the provider */
  url: string;
  /** Favicon of the provider in base64 */
  favicon?: string;
  /** Tags of the provider */
  tags: string[];
  /** Whether the provider is enabled */
  enabled: boolean;
  /** Number of sources the provider has */
  numSources: number;
}

/** Parameters to create a provider */
export interface CreateProvider {
  /** Name of the provider */
  name: string;
  /** Description of the provider */
  description: string;
  /** Documentation URL of the provider */
  url: string;
  /** Favicon of the provider in base64 */
  favicon?: string;
  /** Tags of the provider */
  tags?: string[];
  /** Whether the provider is enabled */
  enabled?: boolean;
}

/** Parameters to partially update a provider */
export interface PatchProvider {
  /** Name of the provider */
  name?: string;
  /** Description of the provider */
  description?: string;
  /** Documentation URL of the provider */
  url?: string;
  /** Favicon of the provider in base64 */
  favicon?: string;
  /** Tags of the provider */
  tags?: string[];
  /** Whether the provider is enabled */
  enabled?: boolean;
}

/** User request against Indicator Aggregator to get source information */
export interface Request {
  /** Database ID of the request */
  id: string;
  /** Time when the request was created */
  createdAt: NaiveDateTime;
  /** Time when the request was updated */
  updatedAt: NaiveDateTime;
  /** Indicator data of the request */
  data: string;
  /** Kind of the indicator */
  kind: string;
  /** Opentelemetry trace ID of the request, can be used with Jaeger to trace the request */
  traceId: string;
}

/** Response of a source following a user request against it and snapshot values of the source (in case the source gets deleted/modified after the request) */
export interface SourceRequest {
  /** Database ID of the source request */
  id: string;
  /** Time when the source request was created */
  createdAt: NaiveDateTime;
  /** Time when the source request was updated */
  updatedAt: NaiveDateTime;
  /** Time when the request was started */
  startedAt: NaiveDateTime;
  /** Time when the request was ended */
  endedAt: NaiveDateTime;
  /** List of errors that occurred during the request */
  errors: Value[];
  /** Data produced by the source from the request */
  data?: Value;
  /** Cache action performed, if any */
  cacheAction?: string;
  /** Time when the cache expired, if any */
  cacheExpiresAt?: NaiveDateTime;
  /** Time when the cache was cached, if cache was present */
  cacheCachedAt?: NaiveDateTime;
  /** Cache key used, if any */
  cacheKey?: string;
  /** Database ID of the request */
  requestId: string;
  /** Database ID of the source */
  sourceId?: string;
  /** Name of the source */
  sourceName: string;
  /** Slug of the source */
  sourceSlug: string;
  /** URL of the source */
  sourceUrl: string;
  /** Favicon of the source */
  sourceFavicon?: string;
}

/** A secret */
export interface Secret {
  /** The database ID of the secret */
  id: string;
  /** The time the secret was created */
  createdAt: NaiveDateTime;
  /** The time the secret was last updated */
  updatedAt: NaiveDateTime;
  /** The name of the secret */
  name: string;
  /** The description of the secret */
  description?: string;
  /** The time the secret expires */
  expiresAt?: NaiveDateTime;
}

/** Defining secrets needed for a source and the link between a source and a secret */
export interface SourceSecret {
  /** Database ID of the source secret */
  id: string;
  /** Timestamp of the creation of the source secret */
  createdAt: NaiveDateTime;
  /** Timestamp of the last update of the source secret */
  updatedAt: NaiveDateTime;
  /** Database ID of the secret */
  secretId?: string;
  /** Name of the source secret */
  name: string;
  /** Description of the source secret */
  description?: string;
  /** Wether the source secret needs a secret linked for the source to work */
  required: boolean;
}

/** A secret with the number of sources that use it */
export interface SecretWithNumSources {
  /** The database ID of the secret */
  id: string;
  /** The time the secret was created */
  createdAt: NaiveDateTime;
  /** The time the secret was last updated */
  updatedAt: NaiveDateTime;
  /** The name of the secret */
  name: string;
  /** The description of the secret */
  description?: string;
  /** The time the secret expires */
  expiresAt?: NaiveDateTime;
  /** The number of sources that use this secret */
  numSources: number;
}

/** Parameters for creating a new secret */
export interface CreateSecret {
  /** The value of the secret */
  value: string;
  /** The name of the secret */
  name: string;
  /** The description of the secret */
  description?: string;
  /** The time the secret expires */
  expiresAt?: NaiveDateTime;
}

/** Parameters for updating a secret */
export interface UpdateSecret {
  /** The value of the secret */
  value?: string;
  /** The name of the secret */
  name?: string;
  /** The description of the secret */
  description?: string;
  /** The time the secret expires */
  expiresAt?: NaiveDateTime;
}

/** Parameters for creating a new source secret */
export interface CreateSourceSecret {
  /** ID of the secret */
  secretId?: string;
  /** Name of the source secret */
  name: string;
  /** Description of the source secret */
  description?: string;
  /** Wether the source secret needs a secret linked for the source to work */
  required: boolean;
}

/** Enum containing the different kinds of server configuration entries */
export enum ServerConfigKind {
  String = "STRING",
  Number = "NUMBER",
  Boolean = "BOOLEAN",
  Code = "CODE",
}

/** Enum containing the different categories of server configuration entries */
export enum ServerConfigCategory {
  Code = "CODE",
  Proxy = "PROXY",
  Sse = "SSE",
  Runners = "RUNNERS",
}

/** Configuration entry for the server */
export interface ServerConfigEntry<T> {
  /** Unique identifier of the server config entry */
  id?: string;
  /** Timestamp of the creation of the server config entry */
  createdAt?: NaiveDateTime;
  /** Timestamp of the last update of the server config entry */
  updatedAt?: NaiveDateTime;
  /** User defined value of the server config entry, if any, otherwise defaults to the default value */
  value?: T;
  /** Default value of the server config entry */
  defaultValue: T;
  /** Friendly name of the server config entry */
  friendlyName: string;
  /** Brief description of the server config entry */
  description: string;
  /** Kind of the server config entry */
  kind: ServerConfigKind;
  /** Category grouping server config entries */
  category: ServerConfigCategory;
}

/** Parameters for updating a server config entry */
export interface UpdateServerConfig {
  /** Name of the server config entry */
  key: string;
  /** User defined value of the server config entry, if any, otherwise defaults to the default value */
  value?: string;
}

/** General server configuration */
export interface ServerConfig {
  javascript_source_template: ServerConfigEntryString;
  python_source_template: ServerConfigEntryString;
  proxy_enabled: ServerConfigEntryBool;
  proxy_type: ServerConfigEntryString;
  proxy_value: ServerConfigEntryString;
  sse_keep_alive: ServerConfigEntryU32;
  sse_number_concurrent_source_fetching: ServerConfigEntryU32;
  javascript_runner_grpc_address: ServerConfigEntryString;
  javascript_runner_enabled: ServerConfigEntryBool;
  python_runner_grpc_address: ServerConfigEntryString;
  python_runner_enabled: ServerConfigEntryBool;
}

/** Kind of the source, related to the language used for corelating data from the source */
export enum SourceKind {
  System = "SYSTEM",
  Python = "PYTHON",
  JavaScript = "JAVA_SCRIPT",
}

/** A place where indicator data is retrieved from */
export interface Source {
  /** Database ID of the source */
  id: string;
  /** Timestamp of the creation of the source */
  createdAt: NaiveDateTime;
  /** Timestamp of the last update of the source */
  updatedAt: NaiveDateTime;
  /** Name of the source */
  name: string;
  /** URL friendly name of the provider */
  slug: string;
  /** Description of the source */
  description: string;
  /** Documentation URL of the source */
  url: string;
  /** Favicon of the provider in base64 */
  favicon?: string;
  /** Tags of the source */
  tags: string[];
  /** Whether the source is enabled, if not, it will not be used when handling indicator requests */
  enabled: boolean;
  /** Indicator kinds supported by the source */
  supportedIndicators: string[];
  /** Indicator kinds disabled by the source */
  disabledIndicators: string[];
  /** Whether the source's background task is enabled */
  taskEnabled: boolean;
  /** Interval in seconds between the source's background task executions */
  taskInterval?: number;
  /** Configuration of the source */
  config: Value[];
  /** Values of the source's configuration */
  configValues: Value[];
  /** Whether the source has a limit of indicator requests */
  limitEnabled: boolean;
  /** Maximum number of indicator requests allowed per interval */
  limitCount?: number;
  /** Interval in seconds between the source's limit resets */
  limitInterval?: number;
  /** Whether the source's cache is enabled */
  cacheEnabled: boolean;
  /** Interval in seconds between the source's cache resets */
  cacheInterval?: number;
  /** Database ID of the linked provider of the source */
  providerId?: string;
  /** Kind of the source, related to the language used for corelating data from the source */
  kind: SourceKind;
  /** Source code of the source */
  sourceCode?: string;
}

/** Parameters to create a source */
export interface CreateSource {
  /** Name of the source */
  name: string;
  /** Description of the source */
  description: string;
  /** Documentation URL of the source */
  url: string;
  /** Favicon of the provider in base64 */
  favicon?: string;
  /** Tags of the source */
  tags: string[];
  /** Whether the source is enabled */
  enabled: boolean;
  /** Indicator kinds supported by the source */
  supportedIndicators: string[];
  /** Indicator kinds disabled by the source */
  disabledIndicators: string[];
  /** Whether the source's background task is enabled */
  taskEnabled: boolean;
  /** Interval in seconds between the source's background task executions */
  taskInterval?: number;
  /** Configuration of the source */
  config: Value[];
  /** Values of the source's configuration */
  configValues: Value[];
  /** Whether the source has a limit of indicator requests */
  limitEnabled: boolean;
  /** Maximum number of indicator requests allowed per interval */
  limitCount?: number;
  /** Interval in seconds between the source's limit resets */
  limitInterval?: number;
  /** Whether the source's cache is enabled */
  cacheEnabled: boolean;
  /** Interval in seconds between the source's cache resets */
  cacheInterval?: number;
  /** Database ID of the linked provider of the source */
  providerId?: string;
  /** Kind of the source, related to the language used for corelating data from the source */
  kind: SourceKind;
  /** Source code of the source */
  sourceCode?: string;
}

/** Parameters to partially update a source */
export interface UpdateSource {
  /** Name of the source */
  name?: string;
  /** Description of the source */
  description?: string;
  /** Documentation URL of the source */
  url?: string;
  /** Favicon of the provider in base64 */
  favicon?: string;
  /** Tags of the source */
  tags?: string[];
  /** Whether the source is enabled */
  enabled?: boolean;
  /** Indicator kinds supported by the source */
  supportedIndicators?: string[];
  /** Indicator kinds disabled by the source */
  disabledIndicators?: string[];
  /** Whether the source's background task is enabled */
  taskEnabled?: boolean;
  /** Interval in seconds between the source's background task executions */
  taskInterval?: number;
  /** Configuration of the source */
  config?: Value[];
  /** Values of the source's configuration */
  configValues?: Value[];
  /** Whether the source has a limit of indicator requests */
  limitEnabled?: boolean;
  /** Maximum number of indicator requests allowed per interval */
  limitCount?: number;
  /** Interval in seconds between the source's limit resets */
  limitInterval?: number;
  /** Whether the source's cache is enabled */
  cacheEnabled?: boolean;
  /** Interval in seconds between the source's cache resets */
  cacheInterval?: number;
  /** Database ID of the linked provider of the source */
  providerId?: string;
  /** Kind of the source, related to the language used for corelating data from the source */
  kind?: SourceKind;
  /** Source code of the source */
  sourceCode?: string;
}

/** Overview of the number of providers, sources, and indicators */
export interface Count {
  /** Number of requests done in the past */
  history: number;
  /** Number of requests done in the past 24 hours */
  historyLast24hrs: number;
  /** Number of source providers */
  providers: number;
  /** Number of enabled source providers */
  enabledProviders: number;
  /** Number of sources */
  sources: number;
  /** Number of enabled sources */
  enabledSources: number;
  /** Number of indicators */
  ignoreLists: number;
  /** Number of enabled indicators */
  enabledIgnoreLists: number;
}

/** A stats helper container for getting a count based on an ID or name of an object */
export interface CountPerId {
  /** ID of the related object */
  id?: string;
  /** Name of the related object */
  name?: string;
  /** Number of object found for the given ID or name */
  count: number;
}

/** A stats helper container for getting a count based on an ID or name of an object for a timeframe */
export interface CountPerIdWrapper {
  /** List of data for the given timeframe */
  data: CountPerId[];
  /** Timeframe for which the data was collected */
  timeWindow: DateTime<Utc>;
}

/** A stats helper container for getting a count divided by cache presence for an hourly timeframe */
export interface CountPerHour {
  /** Number of uncached requests done in the hour */
  uncachedCount: number;
  /** Number of cached requests done in the hour */
  cachedCount: number;
  /** Hour for which the data was collected */
  timeWindow: DateTime<Utc>;
}

/** User able to query and make modifications to Indicator Aggregator */
export interface User {
  /** Database ID of the user */
  id: string;
  /** Time when the user was created */
  createdAt: NaiveDateTime;
  /** Time when the user was updated */
  updatedAt: NaiveDateTime;
  /** OpenID authentication ID of the user, if user authenticated via an OpenID provider */
  authId?: string;
  /** Authentication provider of the user, either an OpenID provider or "IndicatorAggregator" */
  provider: string;
  /** Whether the user is enabled or not, if they are able to login/access the platform */
  enabled: boolean;
  /** Email of the user */
  email: string;
  /** Whether the user has verified their email or not */
  verified: boolean;
  /** Full name of the user */
  name: string;
  /** First part of the user's name */
  givenName?: string;
  /** Last part of the user's name */
  familyName?: string;
  /** Locale/language of the user */
  locale?: string;
  /** Picture of the user */
  picture?: number[];
  /** Roles of the user, defining their access and what they can do on the platform */
  roles: string[];
}

/** What to update in a user */
export interface UpdateUser {
  /** Wheter to enable the user or not */
  enabled?: boolean;
  /** Roles to assign to the user, if any */
  roles?: HashSet<string>;
}

/** Container for a user and the number of logs they have */
export interface UserWithNumLogs {
  /** User information */
  user: User;
  /** Number of user request logs */
  numLogs: number;
}

/** User request log */
export interface DbUserLog {
  /** Database ID of the log */
  id: string;
  /** Time when the log was created */
  createdAt: NaiveDateTime;
  /** Time when the log was modifed */
  updatedAt: NaiveDateTime;
  /** Database ID of the user that made the request */
  userId: string;
  /** IP address of the user that made the request */
  ipAddress: string;
  /** Browser user agent of the user that made the request */
  userAgent: string;
  /** URI path of the request */
  uri: string;
  /** HTTP method of the request */
  method: string;
  /** Opentelemetry trace ID of the request, can be used to correlate logs with a tool like Jaeger */
  traceId: string;
}

/** Request to get the data for a specific indicator from enabled sources supporting the indicator kind */
export interface RequestExecuteParam {
  /** Data of the indicator */
  data: string;
  /** Kind of the indicator */
  kind: IndicatorKind;
  /** List of source IDs to query, if not provided, all sources will be queried */
  sourceIds?: string[];
  /** Ignore errors, will remove all sources that return an error from the response */
  ignoreErrors?: boolean;
}

/** Partial information about a source for SSE start events */
export interface DataSource {
  /** Name of the source */
  name: string;
  /** URL friendly name of the provider */
  slug: string;
  /** Database ID of the source */
  id: string;
  /** Documentation URL of the source */
  url: string;
  /** Favicon of the source in base64 */
  favicon?: string;
}

/** Action took related to the cache */
export enum DataCacheAction {
  FromCache = "FROM_CACHE",
  SavedToCache = "SAVED_TO_CACHE",
}

/** Cache information */
export interface DataCache {
  /** Action related to the cache */
  action?: DataCacheAction;
  /** Time at which the data was cached */
  cachedAt?: NaiveDateTime;
  /** Time at which the data will expire from the cache */
  expiresAt?: NaiveDateTime;
  /** Cache key used to fetch the data */
  cacheKey?: string;
}

/** Timing information of the data fetching */
export interface DataTiming {
  /** Time at the start of the request */
  startedAt: NaiveDateTime;
  /** Time at the end of the request */
  endedAt: NaiveDateTime;
}

/** Error encountered when fetching data from a source */
export type SourceError =
  | { kind: "UNSUPPORTED_INDICATOR"; content?: undefined }
  | { kind: "DISABLED_INDICATOR"; content?: undefined }
  | { kind: "RUNNER_DISABLED"; content: SourceKind }
  | { kind: "SOURCE_DISABLED"; content?: undefined }
  | { kind: "PROVIDER_DISABLED"; content: string }
  | { kind: "WITHIN_IGNORE_LIST"; content: string[] }
  | { kind: "MISSING_SECRET"; content: string[] }
  | { kind: "TIMEOUT"; content?: undefined }
  | { kind: "NOT_FOUND"; content?: undefined }
  | { kind: "UNAUTHORIZED"; content?: undefined }
  | { kind: "REQUEST_ERROR"; content?: undefined }
  | { kind: "RESPONSE_ERROR"; content?: undefined }
  | { kind: "DATABASE_ERROR"; content?: undefined }
  | { kind: "INTERNAL_SERVER_ERROR"; content?: undefined }
  | { kind: "MISSING_SOURCE_CODE"; content?: undefined }
  | { kind: "RATE_LIMITED"; content?: undefined };

/** Data from a source */
export interface Data {
  /** Information about the source */
  source: DataSource;
  /** Information about the data cache */
  cache: DataCache;
  /** Timing information about the data fetching */
  timing: DataTiming;
  /** Error encountered when fetching the data, if any */
  errors: SourceError[];
  /** Data fetched from the source */
  data?: Value;
}

/** Data from a source */
export interface SseDoneData {
  /** Cache information related to the data/request */
  cache: DataCache;
  /** Time at the start and end of the request */
  timing: DataTiming;
  /** Data fetched from the source */
  data?: Value;
}

/** Start SSE data from a source */
export interface SseStartData {
  /** Source related to the data/request */
  source: DataSource;
  /** Has source code linked */
  hasSourceCode: boolean;
}

/** Data returned from the creation of an API token */
export interface CreatedApiToken {
  /** The database ID of the API token */
  id: string;
  /** The value of the API token */
  token: string;
}

/** Data needed to login a user */
export interface LoginUserRequest {
  /** The email of the user to authenticate */
  email: string;
  /** The password of the user to authenticate */
  password: string;
}

/** Response from login request */
export interface LoginUserResponse {
  /** The JWT token created from login request that can be used to authenticate yourself */
  jwtToken: string;
}

/** Data needed to signup/create a new user */
export interface SignupUserRequest {
  /** The name of the user to authenticate */
  name: string;
  /** The email of the user to authenticate */
  email: string;
  /** The password of the user to authenticate */
  password: string;
}

/** Kind of authentication service */
export type AuthServiceKind =
  | {
      kind: "openId";
      content: {
        name: string;
      };
    }
  | { kind: "password"; content?: undefined };

/** General authentication service configuration */
export interface AuthService {
  /** Whether the authentication service is enabled */
  enabled: boolean;
  /** Kind of the authentication service */
  kind: AuthServiceKind;
}

/** Enum containing the different kinds of notifications and it's content */
export type NotificationKind = {
  kind: "MISSING_REQUIRED_SOURCE_SECRET";
  content: MinimalSource;
};

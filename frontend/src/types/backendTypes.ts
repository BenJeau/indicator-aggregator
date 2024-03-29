/*
 Generated by typeshare 1.7.0
*/

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
	id?: Uuid;
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

export type ServerConfigEntryString = ServerConfigEntry<string>;

export type ServerConfigEntryBool = ServerConfigEntry<boolean>;

export type ServerConfigEntryU32 = ServerConfigEntry<number>;

/** List of indicators to ignore when processing requests against sources */
export interface IgnoreList {
	/** Database ID of the ignore list */
	id: Uuid;
	/** Timestamp of when the ignore list was created */
	createdAt: NaiveDateTime;
	/** Timestamp of when the ignore list was last updated */
	updatedAt: NaiveDateTime;
	/** Name of the ignore list */
	name: string;
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
	id: Uuid;
	/** Timestamp of when the ignore list entry was created */
	createdAt: NaiveDateTime;
	/** Timestamp of when the ignore list entry was last updated */
	updatedAt: NaiveDateTime;
	/** Data of the indicator to ignore */
	data: string;
	/** Kind of the indicator to ignore */
	indicatorKind: string;
	/** Database ID of the ignore list the entry belongs to */
	ignoreListId: Uuid;
}

/** Parameters for creating a new ignore list entry */
export interface CreateIngoreListEntry {
	/** Data of the indicator to ignore */
	data: string;
	/** Kind of the indicator to ignore */
	indicatorKind: string;
}

export interface MinimalSource {
	/** Database ID of the source */
	id: Uuid;
	/** Name of the source */
	name: string;
	/** Number of secrets needed for the source */
	numMissingSecrets: number;
}

/** Source provider, organization or service that provides indicators */
export interface Provider {
	/** Database ID of the provider */
	id: Uuid;
	/** Timestamp of the creation of the provider */
	createdAt: NaiveDateTime;
	/** Timestamp of the last update of the provider */
	updatedAt: NaiveDateTime;
	/** Name of the provider */
	name: string;
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
}

/** Provider with the number of sources it has */
export interface ProviderWithNumSources {
	/** Database ID of the provider */
	id: Uuid;
	/** Timestamp of the creation of the provider */
	createdAt: NaiveDateTime;
	/** Timestamp of the last update of the provider */
	updatedAt: NaiveDateTime;
	/** Name of the provider */
	name: string;
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

export interface Request {
	id: Uuid;
	createdAt: NaiveDateTime;
	updatedAt: NaiveDateTime;
	data: string;
	kind: string;
	traceId: string;
}

export interface SourceRequest {
	id: Uuid;
	createdAt: NaiveDateTime;
	updatedAt: NaiveDateTime;
	startedAt: NaiveDateTime;
	endedAt: NaiveDateTime;
	errors: Value[];
	data?: Value;
	cacheAction?: string;
	cacheExpiresAt?: NaiveDateTime;
	cacheCachedAt?: NaiveDateTime;
	cacheKey?: string;
	requestId: Uuid;
	sourceId?: Uuid;
	sourceName: string;
	sourceUrl: string;
	sourceFavicon?: string;
}

/** A secret */
export interface Secret {
	/** The database ID of the secret */
	id: Uuid;
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
	id: Uuid;
	/** Timestamp of the creation of the source secret */
	createdAt: NaiveDateTime;
	/** Timestamp of the last update of the source secret */
	updatedAt: NaiveDateTime;
	/** Database ID of the secret */
	secretId?: Uuid;
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
	id: Uuid;
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
	secretId?: Uuid;
	/** Name of the source secret */
	name: string;
	/** Description of the source secret */
	description?: string;
	/** Wether the source secret needs a secret linked for the source to work */
	required: boolean;
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
	id: Uuid;
	/** Timestamp of the creation of the source */
	createdAt: NaiveDateTime;
	/** Timestamp of the last update of the source */
	updatedAt: NaiveDateTime;
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
	providerId?: Uuid;
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
	providerId?: Uuid;
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
	providerId?: Uuid;
	/** Kind of the source, related to the language used for corelating data from the source */
	kind?: SourceKind;
	/** Source code of the source */
	sourceCode?: string;
}

/** Overview of the number of providers, sources, and indicators */
export interface Count {
	/** Number of requests done in the past */
	history: number;
	/** Number of source providers */
	providers: number;
	/** Number of sources */
	sources: number;
	/** Number of indicators */
	ignoreLists: number;
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

export interface Indicator {
	/** Data of the indicator */
	data: string;
	/** Kind of the indicator */
	kind: IndicatorKind;
}

/** Request to get the data for a specific indicator from enabled sources supporting the indicator kind */
export interface RequestExecuteParam {
	/** Data of the indicator */
	data: string;
	/** Kind of the indicator */
	kind: IndicatorKind;
	/** List of sources to query, if not provided, all sources will be queried */
	sources?: Uuid[];
	/** Ignore errors, will remove all sources that return an error from the response */
	ignoreErrors?: boolean;
}

export interface DataSource {
	/** Name of the source */
	name: string;
	/** Database ID of the source */
	id: Uuid;
	/** Documentation URL of the source */
	url: string;
	/** Favicon of the source in base64 */
	favicon?: string;
}

export enum DataCacheAction {
	FromCache = "FROM_CACHE",
	SavedToCache = "SAVED_TO_CACHE",
}

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

export interface DataTiming {
	/** Time at the start of the request */
	startedAt: NaiveDateTime;
	/** Time at the end of the request */
	endedAt: NaiveDateTime;
}

/** Error encountered when fetching data from a source */
export type SourceError = 
	| { kind: "UNSUPPORTED_INDICATOR", content?: undefined }
	| { kind: "DISABLED_INDICATOR", content?: undefined }
	| { kind: "SOURCE_DISABLED", content?: undefined }
	| { kind: "PROVIDER_DISABLED", content: Uuid }
	| { kind: "WITHIN_IGNORE_LIST", content: Uuid[] }
	| { kind: "MISSING_SECRET", content: Uuid[] }
	| { kind: "TIMEOUT", content?: undefined }
	| { kind: "NOT_FOUND", content?: undefined }
	| { kind: "UNAUTHORIZED", content?: undefined }
	| { kind: "REQUEST_ERROR", content?: undefined }
	| { kind: "RESPONSE_ERROR", content?: undefined }
	| { kind: "DATABASE_ERROR", content?: undefined }
	| { kind: "INTERNAL_SERVER_ERROR", content?: undefined }
	| { kind: "MISSING_SOURCE_CODE", content?: undefined }
	| { kind: "RATE_LIMITED", content?: undefined };

/** Data from a source */
export interface Data {
	source: DataSource;
	cache: DataCache;
	timing: DataTiming;
	/** Error encountered when fetching the data, if any */
	errors: SourceError[];
	/** Data fetched from the source */
	data?: Value;
}

/** Data from a source */
export interface SseDoneData {
	cache: DataCache;
	timing: DataTiming;
	/** Data fetched from the source */
	data?: Value;
}

/** Start SSE data from a source */
export interface SseStartData {
	source: DataSource;
	/** Has source code linked */
	hasSourceCode: boolean;
}

/** Enum containing the different kinds of notifications and it's content */
export type NotificationKind = 
	| { kind: "MISSING_REQUIRED_SOURCE_SECRET", content: MinimalSource };


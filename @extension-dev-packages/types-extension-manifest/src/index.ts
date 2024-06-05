interface IIcons {
  16?: string;
  32?: string;
  48?: string;
  64?: string;
  128?: string;
}

type TPermission =
  | "accessibilityFeatures.modify"
  | "accessibilityFeatures.read"
  | "activeTab"
  | "alarms"
  | "audio"
  | "background"
  | "bookmarks"
  | "browsingData"
  | "certificateProvider"
  | "clipboardRead"
  | "clipboardWrite"
  | "contentSettings"
  | "contextMenus"
  | "cookies"
  | "debugger"
  | "declarativeContent"
  | "declarativeNetRequest"
  | "declarativeNetRequestWithHostAccess"
  | "declarativeNetRequestFeedback"
  | "dns"
  | "desktopCapture"
  | "documentScan"
  | "downloads"
  | "downloads.open"
  | "downloads.ui"
  | "enterprise.deviceAttributes"
  | "enterprise.hardwarePlatform"
  | "enterprise.networkingAttributes"
  | "enterprise.platformKeys"
  | "favicon"
  | "fileBrowserHandler"
  | "fileSystemProvider"
  | "fontSettings"
  | "gcm"
  | "geolocation"
  | "history"
  | "identity"
  | "identity.email"
  | "idle"
  | "loginState"
  | "management"
  | "nativeMessaging"
  | "notifications"
  | "offscreen"
  | "pageCapture"
  | "platformKeys"
  | "power"
  | "printerProvider"
  | "printing"
  | "printingMetrics"
  | "privacy"
  | "processes"
  | "proxy"
  | "readingList"
  | "runtime"
  | "scripting"
  | "search"
  | "sessions"
  | "sidePanel"
  | "storage"
  | "system.cpu"
  | "system.display"
  | "system.memory"
  | "system.storage"
  | "tabCapture"
  | "tabGroups"
  | "tabs"
  | "topSites"
  | "tts"
  | "ttsEngine"
  | "unlimitedStorage"
  | "vpnProvider"
  | "wallpaper"
  | "webAuthenticationProxy"
  | "webNavigation"
  | "webRequest"
  | "webRequestBlocking";

export interface IManifest {
  manifest_version: 3;
  name: string;
  version: string;
  description: string;
  icons: IIcons;
  action?: {
    default_icons?: IIcons;
    default_title?: string;
    default_popup?: string;
  };
  author?: string;
  background?: {
    service_worker?: string;
    type?: string;
  };
  chrome_settings_overrides?: {
    homepage?: string;
    startup_pages: string[];
    search_provider?: {
      alternate_urls?: string[];
      encoding?: string;
      favicon_url?: string;
      image_url?: string;
      image_url_post_params?: string;
      is_deafult: boolean;
      keyword?: string;
      name?: string;
      prepopulated_id?: number;
      search_url: string;
      search_url_post_params?: string;
      suggest_url?: string;
      suggest_url_post_params?: string;
    };
  };
  chrome_url_overrides?: Record<"bookmarks" | "history" | "newtab", string>;
  commands?: Record<
    string,
    {
      suggested_key: Record<
        "default" | "chromeos" | "linux" | "mac" | "windows",
        string
      >;
      description: string;
    }
  >;
  content_scripts?: {
    matches: string[];
    css: string[];
    js: string[];
    run_at: "document_start" | "document_end" | "document_idle";
    match_about_blank: boolean;
    match_origin_as_fallback: boolean;
    world: "ISOLATED" | "MAIN";
  };
  content_security_policy?: {
    extension_pages: string;
    sandbox: string;
  };
  cross_origin_embedder_policy?: {
    value: "require-corp" | "credentialless" | "unsafe-none";
  };
  cross_origin_opener_policy?: {
    value:
      | "same-origin"
      | "same-origin-allow-popups"
      | "restrict-properties"
      | "unsafe-none";
  };
  declarative_net_request?: {
    rule_resources: {
      id: string;
      enabled: boolean;
      path: string;
    }[];
  };
  default_locale?: string;
  devtools_page?: string;
  export?: {
    allowlist: string[];
  };
  externally_connectable?: {
    ids: string[];
    matches: string[];
    accepts_tls_channel_id: boolean;
  };
  homepage_url?: string;
  host_permissions?: string[];
  import?: { id: string; minimum_version?: string }[];
  incognito?: string;
  key?: string;
  minimum_chrome_version?: string;
  oauth2?: {
    client_id: string;
    scopes: string[];
  };
  omnibox?: {
    keyword: string;
  };
  optional_host_permissions?: string[];
  optional_permissions?: TPermission[];
  options_page?: string;
  options_ui?: {
    page?: string;
    open_in_tab?: boolean;
  };
  permissions?: TPermission[];
  requirements?: Record<string, Record<string, string[]>>;
  sandbox?: {
    pages: string[];
  };
  short_name?: string;
  side_panel?: {
    default_path: string;
  };
  storage?: {
    managed_schema: string;
  };
  tts_engine?: {
    voices: {
      voice_name: string;
      lang?: string;
      event_types?: (
        | "start"
        | "word"
        | "sentence"
        | "marker"
        | "end"
        | "error"
      )[];
    }[];
  };
  update_url?: string;
  version_name?: string;
  web_accessible_resources?: {
    resources: string[];
    matches: string[];
    extension_ids: string[];
  };
  file_browser_handlers?: {
    id: string;
    default_title: string;
    file_filters: string[];
  }[];
  file_handlers?: {
    action: string;
    name: string;
    accept: Record<string, string[]>;
    launch_type: "single-client" | "multiple-clients";
  };
  file_system_provider_capabilities?: {
    configurable?: boolean;
    multiple_mounts?: boolean;
    watchable?: boolean;
    source: "file" | "device" | "network";
  };
  input_components?: {
    name: string;
    id: string;
    language: string | string[];
    layouts: string | string[];
    input_view: string;
    options_page: string;
  }[];
}

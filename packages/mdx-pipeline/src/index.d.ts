export interface RemarkKitgridGuardOptions {
  components?: string[];
  allowHtml?: boolean;
}

export type RemarkGuard = (tree: unknown, file?: { path?: string }) => void;

export declare function remarkKitgridGuard(options?: RemarkKitgridGuardOptions): RemarkGuard;
export interface RemarkRewriteDocLinksOptions {
  basePath?: string;
  docsRoot?: string;
}

export declare function remarkRewriteDocLinks(options?: RemarkRewriteDocLinksOptions): RemarkGuard;

export declare const allowedComponents: string[];

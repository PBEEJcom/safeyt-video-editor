export interface TimeSegment {
    start: number;
    end: number;
    isAtBounds?: boolean;
}
export default class YouTube {
    private static safeYTBaseUrl;
    private static youTubeLinkRegex;
    static extractVideoId(youTubeUrl: string): string | undefined;
    static getEncodedSafeYTVideoInformation(videoId: string | undefined, skips: TimeSegment[], videoBounds: TimeSegment | undefined): string;
    static decodeSafeYTLink(safeYtLink: string): {
        videoId: string;
        skips: {
            start: string;
            end: string;
        }[];
        videoBounds?: {
            start?: string;
            end?: string;
        };
    };
    static getSafeYtLink(youTubeVideoId: string, skips: TimeSegment[], videoBounds: TimeSegment | undefined): string;
    static extractSafeYtEncodedInformation(safeYtLink: string): string;
    static isValidYouTubeLink(youTubeLink: string): boolean;
    static isValidSafeYTLink(link: string): boolean;
    static getVideoData(youTubeLink: string): Promise<import("axios").AxiosResponse<any, any>>;
}

/// <reference types="react" />
import * as axios from 'axios';

interface SafeYTDialogProps {
    isEditMode: boolean;
    link: string;
    onSafeYTLinkChange: (safeYTLink: string) => void;
    height: number;
    width: number;
}
declare const SafeYTVideoEditor: (props: SafeYTDialogProps) => JSX.Element;

interface TimeSegment {
    start: number;
    end: number;
    isAtBounds?: boolean;
}
declare class YouTube {
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
    static getVideoData(youTubeLink: string): Promise<axios.AxiosResponse<any, any>>;
}

export { SafeYTVideoEditor, YouTube };

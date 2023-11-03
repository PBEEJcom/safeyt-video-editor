import axios from "axios";

export interface TimeSegment {
  start: number;
  end: number;
  isAtBounds?: boolean;
}

const axiosInstance = axios.create({
  baseURL: 'https://www.youtube.com/oembed',
});

export default class YouTube {
  private static safeYTBaseUrl = "https://safeyt.pbeej.com";
  // eslint-disable-next-line
  private static youTubeLinkRegex = /^(https?:)?(\/\/)?((www\.|m\.)?youtube(-nocookie)?\.com\/((watch)?\?(feature=\w*&)?vi?=|embed\/|vi?\/|e\/)|youtu.be\/)([\w\-]{10,20})/i

  static extractVideoId(youTubeUrl: string): string | undefined {
    const match = youTubeUrl.match(this.youTubeLinkRegex);
    if (match) {
      return match[9];
    }
    return undefined;
  }

  static getEncodedSafeYTVideoInformation(videoId: string | undefined, skips: TimeSegment[], videoBounds: TimeSegment | undefined) {
    return btoa(
      JSON.stringify({
        videoId,
        skips,
        videoBounds,
      })
    )
  }

  static decodeSafeYTLink(safeYtLink: string): { videoId: string, skips: { start: string, end: string }[], videoBounds?: { start?: string, end?: string } } {
    return JSON.parse(atob(this.extractSafeYtEncodedInformation(safeYtLink)));
  }

  static getSafeYtLink(youTubeLink: string, skips: TimeSegment[], videoBounds: TimeSegment | undefined) {
    const youTubeVideoId = this.extractVideoId(youTubeLink);
    const encodedVideoInformation = this.getEncodedSafeYTVideoInformation(youTubeVideoId, skips, videoBounds);
    return `${this.safeYTBaseUrl}/embed/${encodedVideoInformation}`
  }

  static extractSafeYtEncodedInformation(safeYtLink: string) {
    return safeYtLink.split('embed/')[1]
  }

  static isValidYouTubeLink(youTubeLink: string) {
    return !!youTubeLink.match(this.youTubeLinkRegex);
  }

  static isValidSafeYTLink(link: string) {
    return link.startsWith(this.safeYTBaseUrl);
  }

  static getVideoData(youTubeLink: string) {
    return axiosInstance.get('/', {
      params: {
        url: youTubeLink,
        format: 'json'
      }
    });
  }
}

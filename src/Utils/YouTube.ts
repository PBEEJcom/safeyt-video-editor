import axios from "axios";

export interface TimeSegment {
  start: number;
  end: number;
  isAtBounds?: boolean;
}

const axiosInstance = axios.create({
  baseURL: "https://www.youtube.com/oembed",
});

export default class YouTube {
  private static safeYTBaseUrl = "https://safeyt.pbeej.com";

  // eslint-disable-next-line
  private static youTubeLinkRegexes = [
    // Regex designed to match standard youtube links
    // https://www.youtube.com/watch?app=desktop&v=83ac8WGbA60
    // https://www.youtubekids.com/watch?v=gFq9ZqXD1JA
    // https://m.youtube.com/watch?si=ln6_lBR0S9xrHpey&v=gtYw0Gwaxrc&feature=youtu.be
    // https://www.youtube.com/watch?app=desktop&v=w3jreuX_7HI
    // https://www.youtube.com/watch?app=desktop&v=Vyga8VMWXKg
    // https://www.youtube.com/watch?v=5uKmqP3kQ2A&ab_channel=driving4answers
    // https://m.youtube.com/watch?si=ln6_lBR0S9xrHpey&v=gtYw0Gwaxrc&feature=youtu.be
    // https://www.youtube-nocookie.com/watch?v=5uKmqP3kQ2AEnter
    // https://www.youtube.com/watch?v=sjxFJ5plpgY&ab_channel=NickSBF
    /^(https?:)?(\/\/)?((www\.|m\.)?youtube(-nocookie|kids)?\.com\/((watch)?.*?v=(?<videoId>.*?))(&|$))/i,

    // Designed to match short youtube links
    // https://youtu.be/sjxFJ5plpgY
    // https://youtu.be/sjxFJ5plpgY?si=A0wdNWR12pXcpE2C
    /^(https?:)?(\/\/)?((www\.|m\.)?youtu.be\/)(?<videoId>[\w\-]{5,20})/i,
  ];

  static extractVideoId(youTubeUrl: string): string | undefined {
    for (const regex of this.youTubeLinkRegexes) {
      const match = youTubeUrl.match(regex);
      if (match) {
        return match.groups?.videoId;
      }
    }

    return undefined;
  }

  static getEncodedSafeYTVideoInformation(videoId: string | undefined, skips: TimeSegment[], videoBounds: TimeSegment | undefined) {
    return btoa(
      JSON.stringify(
        {
          videoId,
          skips,
          videoBounds,
        },
        (key, value) => {
          if (typeof value === "number") {
            return value.toString();
          }
          return value;
        },
      ),
    );
  }

  static decodeSafeYTLink(safeYtLink: string): {
    videoId: string;
    skips: { start: string; end: string }[];
    videoBounds?: { start?: string; end?: string };
  } {
    let encodedInformation: string;
    try {
      encodedInformation = atob(this.extractSafeYtEncodedInformation(safeYtLink));
    } catch (error) {
      throw error;
    }
    return JSON.parse(encodedInformation);
  }

  static getSafeYtLink(youTubeVideoId: string, skips: TimeSegment[], videoBounds: TimeSegment | undefined) {
    const encodedVideoInformation = this.getEncodedSafeYTVideoInformation(youTubeVideoId, skips, videoBounds);
    return `${this.safeYTBaseUrl}/embed/${encodedVideoInformation}`;
  }

  static extractSafeYtEncodedInformation(safeYtLink: string) {
    return safeYtLink.split("embed/")[1];
  }

  static isValidYouTubeLink(youTubeLink: string) {
    return this.youTubeLinkRegexes.some((regex) => !!youTubeLink.match(regex));
  }

  static isValidSafeYTLink(link: string) {
    return link.startsWith(this.safeYTBaseUrl);
  }

  static getVideoData(youTubeLink: string) {
    return axiosInstance.get("/", {
      params: {
        url: youTubeLink,
        format: "json",
      },
    });
  }
}

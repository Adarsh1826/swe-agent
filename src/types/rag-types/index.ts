export interface FileLookupInterface {
  owner: string;
  repo: string;
  issueData: {
    number: number;
    title: string;
    body: string;
    labels?: string[];
    author: string;
    url?: string;
  };
}

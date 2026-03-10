export interface Author {
  id: string;
  name: string;
  avatar?: string;
}

export interface Reply {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  replies?: Reply[];
}

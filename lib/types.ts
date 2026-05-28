export interface Statement {
  role: '남자친구' | '여자친구';
  when: string;
  what: string;
  how: string;
  feelings: string;
  myFault: string;
  wishes: string;
}

export interface Judgment {
  intentionality: number;
  violence: number;
  repetition: number;
  summary: string;
  intentionalityReason: string;
  violenceReason: string;
  repetitionReason: string;
  solution: string;
  violenceWarning: boolean;
  createdAt: string;
}

export interface Case {
  id: string;
  receiptNumber: string;
  title: string;
  createdAt: string;
  boyfriend?: Statement;
  girlfriend?: Statement;
  judgment?: Judgment;
}

export interface CaseDB {
  cases: Case[];
}

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios from "axios";

export interface LabelSearchQuery {
  search?: string;
  scopes?: string[];
  colors?: string[];
  conditional_only?: boolean;
  date_from?: string;
  date_to?: string;
  ids?: number[];
}

export interface ProposalSearchQuery {
  search?: string;
  status?: string;
  object_type?: string;
  object_id?: string;
  proposed_by?: string;
  date_from?: string;
  date_to?: string;
  ids?: number[];
}

type LabelSearchParams = {
  query: LabelSearchQuery;
  skip?: number;
  limit?: number;
};
type ProposalSearchParams = {
  query: ProposalSearchQuery;
  skip?: number;
  limit?: number;
};

const labelSearchMutationFn = async (
  params: LabelSearchParams
): Promise<any> => {
  const { query, skip = 0, limit = 100 } = params;
  const res = await axios.post(
    `/sensitivity-labels/search/labels?skip=${skip}&limit=${limit}`,
    query
  );
  return res.data;
};

const proposalSearchMutationFn = async (
  params: ProposalSearchParams
): Promise<any> => {
  const { query, skip = 0, limit = 100 } = params;
  const res = await axios.post(
    `/sensitivity-labels/search/proposals?skip=${skip}&limit=${limit}`,
    query
  );
  return res.data;
};

export function useAdvancedLabelSearch(): UseMutationResult<
  any,
  unknown,
  LabelSearchParams
> {
  return useMutation(labelSearchMutationFn);
}

export function useAdvancedProposalSearch(): UseMutationResult<
  any,
  unknown,
  ProposalSearchParams
> {
  return useMutation(proposalSearchMutationFn);
}

import {createContext, useContext} from 'react'

export type PaginationContextType = {
  page: number,
  page_size: number,
  count: number,
  handleGoToPage: (page: number) => void,
  handleChangePageSize: (page: number) => void,
  handleChangeCount: (page: number) => void,
}

export const defaultPagination = {
  page: 0,
  page_size: 10,
  count: 10
}

// @ts-expect-error - The context is initialized with undefined, but will be provided a value.
const PaginationContext = createContext<PaginationContextType>(undefined);

export const usePaginationContext = (): PaginationContextType => useContext(PaginationContext)

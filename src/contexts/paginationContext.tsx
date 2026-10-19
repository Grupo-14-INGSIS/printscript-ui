import {createContext, ReactNode, useCallback, useContext, useState} from 'react'

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

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

export const PaginationProvider = ({children}: { children: ReactNode }) => {
  const [page, setPage] = useState<number>(defaultPagination.page ?? 0)
  const [pageSize, setPageSize] = useState<number>(defaultPagination.page_size ?? 10)
  const [count, setCount] = useState(defaultPagination.count ?? 10)

  // useCallback: Home usa estos handlers como dependencias de useEffect. Si se recrearan en cada
  // render, el efecto que vuelve a la página 0 al cambiar un filtro se dispararía también al
  // cambiar de página, y la flecha de "siguiente" rebotaría a la primera página.
  const handleGoToPage = useCallback((page: number) => {
    setPage(page)
  }, [])

  const handleChangePageSize = useCallback((pageSize: number) => {
    setPageSize(pageSize)
    setPage(0)
  }, [])

  const handleChangeCount = useCallback((newCount: number) => {
    setCount(newCount)
  }, [])

  return (
      <PaginationContext.Provider value={{
        page,
        page_size: pageSize,
        count,
        handleGoToPage,
        handleChangePageSize,
        handleChangeCount
      }}>
        {children}
      </PaginationContext.Provider>
  )
}

export const usePaginationContext = (): PaginationContextType => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }
  return context;
}

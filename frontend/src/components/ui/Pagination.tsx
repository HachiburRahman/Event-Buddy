// frontend/src/components/ui/Pagination.tsx

import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const pageLinkLimit = 7; 

    if (totalPages <= pageLinkLimit) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    const leftSibling = currentPage - 1;
    const rightSibling = currentPage + 1;
    
    let showLeftEllipsis = false;
    let showRightEllipsis = false;

    pageNumbers.push(1);

    if (currentPage > 3) {
      showLeftEllipsis = true;
      pageNumbers.push('...');
    }
    
    for(let i = leftSibling; i <= rightSibling; i++){
        if(i > 1 && i < totalPages){
            pageNumbers.push(i);
        }
    }
    
    if (currentPage < totalPages - 2) {
      showRightEllipsis = true;
      pageNumbers.push('...');
    }
    
    pageNumbers.push(totalPages);

    return [...new Set(pageNumbers)];
  };

  const pagesToRender = generatePageNumbers();
  
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination">
      <ul className="inline-flex items-center -space-x-px">
        {pagesToRender.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  ...
                </span>
              </li>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`
                  px-4 py-2 leading-tight border transition-colors
                  ${
                    isCurrent
                      ? 'bg-primary-blue text-white border-primary-blue z-10'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                  }
                `}
              >
                {page}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Pagination;
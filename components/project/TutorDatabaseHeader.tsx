import React from 'react';
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRouter } from "@/components/navigation";

interface TutorDatabaseHeaderProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  isSearching: boolean;
  searchTerm: string;
  searchInput: string;
  fetchTutorData: (search: string, page: number, limit: number) => void;
  itemsPerPage: number;
  exportToCSV: () => void;
  columnManager: React.ReactNode;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  handleSearchInputChange: (value: string) => void;
  handleSearchClick: () => void;
  handleClearSearch: () => void;
  categories: string[];
  refreshData?: () => void;
}

export const TutorDatabaseHeader: React.FC<TutorDatabaseHeaderProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  isLoading,
  isSearching,
  searchTerm,
  searchInput,
  fetchTutorData,
  itemsPerPage,
  exportToCSV,
  columnManager,
  categoryFilter,
  setCategoryFilter,
  handleSearchInputChange,
  handleSearchClick,
  handleClearSearch,
  categories,
  refreshData
}) => {
  const router = useRouter();

  const handleDebugCheck = async () => {
    try {
      const response = await fetch('/api/debug/tutor-count', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = await response.json();
      console.log('🔍 Debug Info:', data);
      alert(`Debug Info:\nTotal Users: ${data.debug?.totalUsers}\nEnvironment: ${data.environment}\nTimestamp: ${data.timestamp}\nCheck console for full details.`);
    } catch (error) {
      console.error('Debug check failed:', error);
      alert('Debug check failed. Check console for details.');
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border mb-4 p-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="ph:table" className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Tutor Database
            </h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Page {currentPage}/{totalPages} • {totalRecords} records
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData || (() => fetchTutorData(searchTerm, currentPage, itemsPerPage))}
            disabled={isLoading || isSearching}
            className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:text-primary"
            title="Refresh data"
          >
            <Icon
              icon={isLoading ? "ph:spinner" : "ph:arrow-clockwise"}
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDebugCheck}
              className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:text-primary"
              title="Debug cache check"
            >
              <Icon icon="ph:bug" className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={exportToCSV}
            className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:text-primary"
            title="Export to TSV"
          >
            <Icon icon="ph:download" className="h-4 w-4" />
          </Button>
          {columnManager}
          <Button
            size="icon"
            onClick={() => router.push('/eduprima/main/ops/em/database-tutor/add')}
            className="bg-primary hover:bg-primary/90 h-8 w-8 text-primary-foreground"
            title="Add new tutor"
          >
            <Icon icon="ph:plus" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 mt-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Icon
              icon="ph:magnifying-glass"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Search by name, email, TRN, program, subjects..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchClick();
                }
              }}
              className="pl-10 pr-8 h-8 text-sm"
            />
            {searchInput && (
              <Button
                variant="ghost"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <Icon icon="ph:x" className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchClick}
            disabled={isLoading || isSearching}
            className="h-8 px-3 text-sm"
          >
            {isSearching ? (
              <>
                <Icon icon="ph:spinner" className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Icon icon="ph:magnifying-glass" className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
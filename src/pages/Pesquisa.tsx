import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  Globe,
  BookOpen,
  Lightbulb,
  Clock,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  cached: boolean;
  provider: string;
}

export default function Pesquisa() {
  const { fetchApi } = useApi();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInfo, setSearchInfo] = useState<{ cached: boolean; provider: string } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const suggestedSearches = [
    'chmod exemplos práticos',
    'LXC vs Docker diferenças',
    'Proxmox VE backup',
    'systemctl comandos',
    'Linux permissões explicado',
    'ZFS storage proxmox',
    'iptables firewall básico',
    'cron job agendamento',
  ];

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResults([]);
    setSearchInfo(null);
    
    try {
      const res = await fetchApi(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Erro ao pesquisar');
      }
      
      const data = await res.json();
      setResults(data.results || []);
      setSearchInfo({ cached: false, provider: data.provider || 'unknown' });
      
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (err) {
      // Check if it's a network error (backend offline)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Backend não disponível. Configure e inicie o servidor local para usar a pesquisa online.');
      } else if (err instanceof Error && err.message.includes('não configurado')) {
        setError('Pesquisa não configurada. Configure SEARXNG_URL ou SERPER_API_KEY no backend.');
      } else {
        setError('Pesquisa não disponível. Verifique se o backend está rodando e se SEARXNG_URL ou SERPER_API_KEY está configurado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            Pesquisa Online
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Encontre documentação, tutoriais e recursos para auxiliar seus estudos
          </p>
        </div>

        {/* Search box */}
        <Card className="p-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Digite sua pesquisa... (ex: chmod exemplos)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-lg"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={() => handleSearch()} 
              disabled={isLoading || !query.trim()}
              className="h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Pesquisar
                </>
              )}
            </Button>
          </div>

          {/* Suggestions */}
          {!results.length && !isLoading && !error && (
            <div className="mt-4 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pesquisas recentes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Sugestões
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedSearches.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Erro na pesquisa</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Search info */}
        {searchInfo && results.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{results.length} resultados encontrados</span>
            <div className="flex items-center gap-2">
              {searchInfo.cached && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Cache
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {searchInfo.provider}
              </Badge>
            </div>
          </div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="card-hover">
                    <a 
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Globe className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{getDomainFromUrl(result.url)}</span>
                              {result.source && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.source}
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="font-medium text-primary hover:underline line-clamp-1">
                              {result.title}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.snippet}
                            </p>
                          </div>
                          
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </a>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state after search */}
        {!isLoading && !error && results.length === 0 && query && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum resultado</h3>
            <p className="text-muted-foreground">
              Tente reformular sua pesquisa ou use termos diferentes.
            </p>
          </Card>
        )}

        {/* Info card */}
        <Card className="border-info/30 bg-info/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-info">Dica de pesquisa</p>
              <p className="text-muted-foreground">
                Seja específico nos termos de busca. Por exemplo, em vez de "permissões", 
                tente "chmod 755 exemplos Linux" para resultados mais relevantes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

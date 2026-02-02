import { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CSVUploader } from '@/components/CSVUploader';
import { Dashboard } from '@/components/Dashboard';
import { Footer } from '@/components/Footer';
import { StatementsSidebar, filterByTimeframe } from '@/components/StatementsSidebar';
import { parseFile } from '@/lib/fileParser';
import { detectSubscriptions, type DetectedSubscription } from '@/lib/subscriptionDetector';
import { DEMO_SUBSCRIPTIONS } from '@/lib/demoData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SidebarProvider } from '@/components/ui/sidebar';

type AppState = 'landing' | 'uploading' | 'results';

const STORAGE_KEY = 'subtracker-data';

interface StoredData {
  subscriptions: DetectedSubscription[];
  isDemo: boolean;
}

const Index = () => {
  const [storedData, setStoredData, clearStoredData] = useLocalStorage<StoredData | null>(STORAGE_KEY, null);
  
  const [state, setState] = useState<AppState>(() => storedData ? 'results' : 'landing');
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>(() => storedData?.subscriptions || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDemo, setIsDemo] = useState(() => storedData?.isDemo || false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter subscriptions by selected timeframe and search query
  const filteredSubscriptions = useMemo(() => {
    return filterByTimeframe(subscriptions, selectedTimeframe, searchQuery);
  }, [subscriptions, selectedTimeframe, searchQuery]);

  // Persist to localStorage whenever subscriptions change
  useEffect(() => {
    if (subscriptions.length > 0) {
      setStoredData({ subscriptions, isDemo });
    }
  }, [subscriptions, isDemo, setStoredData]);

  const scrollToUpload = useCallback(() => {
    setState('uploading');
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleTryDemo = useCallback(() => {
    setIsProcessing(true);
    setIsDemo(true);
    
    setTimeout(() => {
      setSubscriptions(DEMO_SUBSCRIPTIONS);
      setIsProcessing(false);
      setState('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  }, []);

  const handleFileSelect = useCallback((content: string, fileName: string) => {
    setIsProcessing(true);
    setIsDemo(false);
    
    setTimeout(() => {
      const transactions = parseFile(fileName, content);
      const detected = detectSubscriptions(transactions);
      setSubscriptions(detected);
      setIsProcessing(false);
      setState('results');
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }, 800);
  }, []);

  const handleReset = useCallback(() => {
    setState('landing');
    setSubscriptions([]);
    setIsDemo(false);
    setSelectedTimeframe('all');
    setSearchQuery('');
    clearStoredData();
  }, [clearStoredData]);

  const handleHome = useCallback(() => {
    setState('landing');
    setSelectedTimeframe('all');
    setSearchQuery('');
  }, []);

  const handleAddSubscription = useCallback((subscription: DetectedSubscription) => {
    setSubscriptions(prev => [...prev, subscription]);
  }, []);

  // Show sidebar only in results view
  if (state === 'results') {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <StatementsSidebar
            subscriptions={subscriptions}
            onHome={handleHome}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1">
              <Dashboard 
                subscriptions={filteredSubscriptions} 
                onReset={handleReset} 
                onAddSubscription={handleAddSubscription}
                isDemo={isDemo}
                selectedTimeframe={selectedTimeframe}
              />
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero onGetStarted={scrollToUpload} onTryDemo={handleTryDemo} />
        {(state === 'uploading' || state === 'landing') && (
          <CSVUploader onFileSelect={handleFileSelect} isLoading={isProcessing} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

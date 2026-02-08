import { useState, useMemo, memo } from 'react';
import { ICON_MAP, type IconName } from '../../constants/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X as CloseIcon, HelpCircle } from 'lucide-react';

const IconItem = memo(({ name, isSelected, onClick }: { 
  name: IconName; 
  isSelected: boolean; 
  onClick: () => void 
}) => {
  const Icon = ICON_MAP[name] || HelpCircle;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
        isSelected 
          ? "border-primary bg-primary/10 text-primary shadow-sm" 
          : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon size={22} strokeWidth={1.5} />
      <span className="text-[9px] mt-2 font-medium truncate w-full text-center">
        {name}
      </span>
    </button>
  );
});

IconItem.displayName = 'IconItem';

interface Props {
  selected: IconName;
  onChange: (icon: IconName) => void;
}

export function IconPicker({ selected, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const CurrentIcon = ICON_MAP[selected] || HelpCircle;

  const filteredIcons = useMemo(() => {
    return (Object.keys(ICON_MAP) as IconName[]).filter(name => 
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-3 bg-background border border-border rounded-xl hover:border-primary transition-all flex items-center justify-center min-w-[52px]"
      >
        <CurrentIcon size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-card">
                <span className="font-bold text-sm uppercase tracking-widest">Library Icon</span>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input 
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Cari berdasarkan nama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div 
                  className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1"
                  style={{ contain: 'content' }}
                >
                  {filteredIcons.map((name) => (
                    <IconItem 
                      key={name}
                      name={name}
                      isSelected={selected === name}
                      onClick={() => {
                        onChange(name);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
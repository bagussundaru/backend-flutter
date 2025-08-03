interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor: string;
  changeLabel?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon, 
  iconColor,
  changeLabel 
}: StatsCardProps) {
  const changeColorClass = {
    positive: 'text-emerald-600 bg-emerald-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-slate-600 bg-slate-100'
  }[changeType];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeColorClass}`}>
                {change}
              </span>
              {changeLabel && (
                <span className="text-xs text-slate-500 ml-2">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${iconColor}`}>
          <i className={`${icon} text-white text-lg`}></i>
        </div>
      </div>
    </div>
  );
}

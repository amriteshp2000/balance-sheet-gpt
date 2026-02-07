// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  finbot: {
    bg: 'bg-finbot-50 dark:bg-finbot-900/20',
    icon: 'bg-finbot-100 dark:bg-finbot-800/50 text-finbot-600 dark:text-finbot-400',
    text: 'text-finbot-600 dark:text-finbot-400',
  },
  profit: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  loss: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
  },
};

const StatsCard = ({ title, value, icon: Icon, trend, trendUp, subtitle, color = 'finbot' }) => {
  const colors = colorMap[color] || colorMap.finbot;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`card-hover p-5 ${colors.bg}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trendUp ? 'text-profit' : 'text-loss'
          }`}>
            {trendUp ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-dark-500 dark:text-dark-400">
          {title}
        </h3>
        <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
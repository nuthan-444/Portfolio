import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import defaultConfig from '../config';

const ConfigContext = createContext(defaultConfig);

export const ConfigProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState(defaultConfig);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        const data = res.data;
        // Merge API values on top of defaults (skip empty strings)
        setSiteConfig({
          ...defaultConfig,
          ownerName: data.ownerName || defaultConfig.name,
          tagline: data.tagline || defaultConfig.tagline,
          resumeUrl: data.resumeUrl || defaultConfig.resumeUrl,
          social: {
            github: data.social?.github || defaultConfig.social.github,
            linkedin: data.social?.linkedin || defaultConfig.social.linkedin,
            twitter: data.social?.twitter || defaultConfig.social.twitter,
            email: data.social?.email || defaultConfig.social.email,
          },
        });
      } catch (e) {
        // Fall back to defaults silently
      }
    };
    fetchConfig();
  }, []);

  return <ConfigContext.Provider value={siteConfig}>{children}</ConfigContext.Provider>;
};

export const useSiteConfig = () => useContext(ConfigContext);

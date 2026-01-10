import { useEffect, useState } from 'react';

export function useElectron() {
    const [isElectron, setIsElectron] = useState(false);
    const [platform, setPlatform] = useState<string>('web');

    useEffect(() => {
        const checkElectron = async () => {
            if (window.electronAPI?.isElectron) {
                setIsElectron(true);
                try {
                    const platformName = await window.electronAPI.getPlatform();
                    setPlatform(platformName);
                } catch (error) {
                    console.error('Failed to get platform:', error);
                }
            }
        };

        checkElectron();
    }, []);

    return {
        isElectron,
        platform,
        minimizeWindow: () => window.electronAPI?.minimizeWindow(),
        maximizeWindow: () => window.electronAPI?.maximizeWindow(),
        closeWindow: () => window.electronAPI?.closeWindow(),
    };
}

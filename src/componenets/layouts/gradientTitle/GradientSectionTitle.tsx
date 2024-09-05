import React, { useCallback, useMemo, useRef } from 'react';

interface GradientSectionTitleProps {
  title: string;
}

const colorPalettes = [
  ['#ff9a9e', '#fad0c4'],
  ['#a18cd1', '#fbc2eb'],
  ['#ffecd2', '#fcb69f'],
  ['#ff6e7f', '#bfe9ff'],
  ['#1FA2FF', '#12D8FA'],
  ['#FBAB7E', '#F7CE68'],
  ['#85FFBD', '#FFFB7D'],
  ['#FF9A8B', '#FF6A88'],
  ['#43e97b', '#38f9d7'],
  ['#37ecba', '#72afd3'],
  ['#FE5F75', '#FC9842'],
  ['#ff9966', '#ff5e62'],
  ['#ff512f', '#dd2476'],
  ['#00c6ff', '#0072ff'],
  ['#92fe9d', '#00c9ff'],
  ['#c471f5', '#fa71cd'],
  ['#f6d365', '#fda085'],
  ['#f093fb', '#f5576c'],
  ['#5ee7df', '#b490ca'],
  ['#d299c2', '#fef9d7'],
  ['#fdcbf1', '#e6dee9'],
  ['#a1c4fd', '#c2e9fb'],
  ['#89f7fe', '#66a6ff'],
  ['#e0c3fc', '#8ec5fc'],
  ['#fddb92', '#d1fdff'],
  ['#9890e3', '#b1f4cf'],
  ['#ee9ca7', '#ffdde1'],
  ['#ffd3a5', '#fd6585'],
  ['#e0c3fc', '#8ec5fc'],
  ['#fbc2eb', '#a6c1ee'],
  ['#fda085', '#f6d365'],
  ['#ff9a9e', '#fecfef'],
  ['#c79081', '#dfa579'],
  ['#f7797d', '#FBD786'],
  ['#c2e9fb', '#a1c4fd'],
  ['#FFB75E', '#ED8F03'],
  ['#ff0844', '#ffb199'],
  ['#f83600', '#f9d423'],
  ['#EECDA3', '#EF629F'],
  ['#4facfe', '#00f2fe'],
  ['#c3cfe2', '#c3cfe2'],
  ['#ff4b1f', '#ff9068'],
  ['#FF416C', '#FF4B2B'],
];

const GradientSectionTitle: React.FC<GradientSectionTitleProps> = React.memo(({ title }) => {
  const usedPalettesRef = useRef<Set<string>>(new Set());

  const getRandomPalette = useCallback(() => {
    const availablePalettes = colorPalettes.filter(palette => !usedPalettesRef.current.has(palette.join()));
    
    if (availablePalettes.length === 0) {
      usedPalettesRef.current.clear();
      return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    }
    
    const newPalette = availablePalettes[Math.floor(Math.random() * availablePalettes.length)];
    usedPalettesRef.current.add(newPalette.join());
    return newPalette;
  }, []);

  const currentPalette = useMemo(() => getRandomPalette(), [getRandomPalette]);

  const titleStyle = useMemo(() => {
    const gradient = `linear-gradient(120deg, ${currentPalette.join(', ')})`;
    return {
      backgroundImage: gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    };
  }, [currentPalette]);

  return (
    <span className={'section-title'} style={titleStyle}>
      {title}
    </span>
  );
});

export default GradientSectionTitle;

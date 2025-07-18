import React from 'react';

interface FuriganaTextProps {
  content: string;
  showFurigana: boolean;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const FuriganaText: React.FC<FuriganaTextProps> = ({ 
  content, 
  showFurigana, 
  fontSize = 'base',
  className = ''
}) => {
  if (!showFurigana) {
    // Return text without furigana
    const cleanText = content.replace(/\{[^}]*\}/g, '');
    return (
      <div className={`text-${fontSize} ${className}`}>
        {cleanText}
      </div>
    );
  }

  // Parse furigana content
  const parseContent = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Regex to match kanji{reading} pattern
    const furiganaRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = furiganaRegex.exec(text)) !== null) {
      // Add any text before the match
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push({
          type: 'text',
          content: beforeText
        });
      }

      // Add the furigana part
      parts.push({
        type: 'furigana',
        kanji: match[1],
        reading: match[2]
      });

      currentIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (currentIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(currentIndex)
      });
    }

    return parts;
  };

  const parts = parseContent(content);

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return { main: 'text-sm', furigana: 'text-xs' };
      case 'base':
        return { main: 'text-base', furigana: 'text-xs' };
      case 'lg':
        return { main: 'text-lg', furigana: 'text-sm' };
      case 'xl':
        return { main: 'text-xl', furigana: 'text-sm' };
      case '2xl':
        return { main: 'text-2xl', furigana: 'text-base' };
      default:
        return { main: 'text-base', furigana: 'text-xs' };
    }
  };

  const { main, furigana } = getFontSizeClasses();

  return (
    <div className={`${main} ${className}`} style={{ lineHeight: '2.5' }}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else {
          return (
            <ruby key={index} className="ruby-text">
              {part.kanji}
              <rt className={`${furigana} text-gray-600`}>
                {part.reading}
              </rt>
            </ruby>
          );
        }
      })}
    </div>
  );
};

export default FuriganaText;
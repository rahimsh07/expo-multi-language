import { useTranslateLang } from '@/hooks/useLiveTranslation';
import { maskTextWithDots } from '@/utils';
import { Text, TextProps } from 'react-native';

type Props = {
    children: string;
    isVisible?: boolean;
} & TextProps;


const TranslationText = ({ children, ...textProps }: Props) => {
    const { text, translating } = useTranslateLang(children);
    
    return (
        <Text {...textProps}>
            {translating ? maskTextWithDots(children) : text}
        </Text>
    );
};



export default TranslationText
import { DimensionValue, StyleSheet, View } from 'react-native';

type SkeletonProps = {
    height?: number;
    radius?: number;
    width?: DimensionValue;
};

const Skeleton = ({ height = 14, radius = 4, width = '100%' }: SkeletonProps) => {
    return (
        <View
            style={[
                styles.skeleton,
                {
                    height,
                    width,
                    borderRadius: radius,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        width: '100%',
        backgroundColor: '#2a2a2a', // dark theme friendly
    },
});

export default Skeleton;

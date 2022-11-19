import { ActivityIndicator } from 'react-native'
import Slider from '@react-native-community/slider';
import * as S from './styles'

export function AngleController({
  isFreeMode,
  sliderValue,
  onChangeSliderValue,
  handleAngleControl,
  handleClearAngle,
  angleControlLoading,
}){
  return (
    <S.ContainerAngleController isDisabled={!isFreeMode}>
        <S.AngleControllerText>Angulação</S.AngleControllerText>
        <S.SliderValue>{sliderValue}°</S.SliderValue>
        <Slider
          disabled={!isFreeMode}
          style={{ height: 40 }}
          minimumValue={-30}
          maximumValue={30}
          step={5}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#0300FF"
          thumbTintColor="#0300FF"
          value={sliderValue}
          onValueChange={onChangeSliderValue}
        />
        <S.AngleRangeBox>
          <S.AngleRangeText>-30°</S.AngleRangeText>
          <S.AngleRangeText>30°</S.AngleRangeText>
        </S.AngleRangeBox>

        <S.ButtonClear
          disabled={!isFreeMode}
          onPress={handleClearAngle}
        >
          <S.ButtonClearText>Limpar</S.ButtonClearText>
        </S.ButtonClear>

        <S.ButtonSubmit
          disabled={!isFreeMode}
          onPress={handleAngleControl}
        >
          {angleControlLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <S.ButtonSubmitText>Enviar</S.ButtonSubmitText>
            )
          }
        </S.ButtonSubmit>
      </S.ContainerAngleController>
  )
}
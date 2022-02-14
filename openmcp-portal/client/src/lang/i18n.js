import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // 사용자의 언어 설정을 기억하기 위해 필요한 플러그인
import { initReactI18next } from 'react-i18next';

import translationEn from './translation.en'
import translationKo from './translation.ko'

const resource = {
    en : {
        translation: translationEn
    },
    ko : {
        translation: translationKo
    }
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: resource,
//         lang: 'en',  detector를 쓰려면 이 부분은 쓰지 않는다. 
        fallbackLng: 'ko',
        debug: true,
        keySeparator: ".",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
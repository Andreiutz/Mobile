import {useNetwork} from "./useNetwork";
import React , {useRef, useEffect} from 'react';
import {IonItem} from '@ionic/react';
import {useAppState} from "./useAppState";
import { CreateAnimation, createAnimation } from '@ionic/react';

function simpleAnimationJS() {
    const el = document.querySelector('.network-status-label');
    if (el) {
        const animation = createAnimation()
            .addElement(el)
            .duration(7000)
            .direction('alternate')
            .iterations(Infinity)
            .keyframes([
                { offset: 0, transform: 'translateX(0)', opacity: '1' },
                { offset: 0.5, transform: 'translateX(30%)', opacity: '1' },
                { offset: 1, transform: 'translateX(0)', opacity: '1' }
            ]);
        animation.play();
    }
}
const NetworkStatus: React.FC = () => {
    const elCRef = useRef(null)
    const animationRef = useRef<CreateAnimation>(null);
    const {networkStatus} = useNetwork();
    useEffect(simpleAnimationJS, []);
    return (
        <div className="network-status-label">
            {
                networkStatus.connected &&
                <IonItem>
                    Online
                </IonItem>
            }
            {
                !networkStatus.connected &&
                <IonItem>
                    Offline
                </IonItem>
            }
        </div>
    )
}

export default NetworkStatus
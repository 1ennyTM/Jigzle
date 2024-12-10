import { Devvit } from '@devvit/public-api';
import { WebviewContainer } from '../WebviewContainer.js';
export const EditorPage = (props) => {
    return (Devvit.createElement("vstack", { grow: true, height: "100%" },
        Devvit.createElement(WebviewContainer, { ...props, onCancel: () => { props.onCancel(); } })));
};
//<SplashScreen context={context} webviewVisible={webviewVisible} setWebviewVisible={setWebviewVisible} />
//# sourceMappingURL=EditorPage.js.map
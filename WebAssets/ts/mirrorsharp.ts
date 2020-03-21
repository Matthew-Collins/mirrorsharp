import type { EditorState, EditorStateConfig } from '@codemirror/next/state';
import type { Language, DiagnosticData, ServerOptions } from './interfaces/protocol';
import type { EditorOptions, DestroyOptions } from './interfaces/editor';
import { SelfDebug } from './main/self-debug';
import { Connection } from './main/connection';
import { Editor } from './main/editor';

export { Language, DiagnosticData, ServerOptions };

export interface MirrorSharpOptions<TExtensionData = never> {
    serviceUrl: string;

    initialText?: string;

    selfDebugEnabled?: boolean;

    language?: Language;

    on?: EditorOptions<TExtensionData>['on'];

    forCodeMirror?: EditorStateConfig;
}

export interface MirrorSharp<TServerOptions extends ServerOptions = ServerOptions> {
    getCodeMirror(): { state: EditorState };
    //setText(text: string): void;
    getLanguage(): Language;
    setLanguage(value: Language): void;
    sendServerOptions(value: TServerOptions): Promise<void>;
    destroy(destroyOptions: DestroyOptions): void;
}

export default function mirrorsharp<
    TServerOptions extends ServerOptions = ServerOptions,
    TExtensionData = never
>(container: HTMLElement, options: MirrorSharpOptions<TExtensionData>): MirrorSharp<TServerOptions> {
    const selfDebug = options.selfDebugEnabled ? new SelfDebug<TExtensionData>() : null;
    const connection = new Connection(options.serviceUrl, selfDebug);
    const editor = new Editor(container, connection, selfDebug, options);

    return Object.freeze({
        getCodeMirror: () => editor.getCodeMirror(),
        //setText: (text: string) => editor.setText(text),
        getLanguage: () => editor.getLanguage(),
        setLanguage: (value: Language) => editor.setLanguage(value),
        sendServerOptions: (value: TServerOptions) => editor.sendServerOptions(value),

        destroy(destroyOptions?: DestroyOptions) {
            editor.destroy(destroyOptions);
            connection.close();
        }
    });
}
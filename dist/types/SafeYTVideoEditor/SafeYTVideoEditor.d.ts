import './SafeYTVideoEditor.css';
export interface SafeYTDialogProps {
    isEditMode: boolean;
    link: string;
    onSafeYTLinkChange: (safeYTLink: string) => void;
    height: number;
    width: number;
}
declare const SafeYTVideoEditor: (props: SafeYTDialogProps) => JSX.Element;
export default SafeYTVideoEditor;

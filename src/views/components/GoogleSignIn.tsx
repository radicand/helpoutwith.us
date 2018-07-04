import * as React from 'react';

interface IProps {
    onSignIn?: (googleUser?: { [key: string]: any }) => void;
    height?: number;
    width?: number;
    theme?: 'dark' | 'light';
    longtitle?: boolean;
}

interface IState {}

class GoogleSignIn extends React.Component<IProps, IState> {
    private renderProps: any;
    public componentWillMount() {
        this.renderProps = {
            scope: 'profile email',
            width: this.props.width || '125',
            height: this.props.height || 40,
            longtitle:
                this.props.longtitle === undefined
                    ? false
                    : this.props.longtitle,
            theme: this.props.theme || 'dark',
            onsuccess: this.onSuccess,
            onfailure: this.onFailure,
        };
    }
    public componentDidMount() {
        if (window.gapi) {
            this.renderGoogleLoginButton();
        } else {
            window.addEventListener(
                'google-loaded',
                this.renderGoogleLoginButton,
            );
        }
    }

    public componentWillUnmount() {
        this.onSuccess = undefined;
        window.removeEventListener(
            'google-loaded',
            this.renderGoogleLoginButton,
        );
    }

    public render() {
        return (
            <div
                style={{ width: this.renderProps.width, margin: '0 auto' }}
                id="myg-signin2"
            >
                Loading...
            </div>
        );
    }

    private onSuccess = (googleUser?: any) => {
        if (this.props.onSignIn) {
            return this.props.onSignIn(googleUser);
        }
    };

    private onFailure = (error: any) => {
        console.log(error);
    };

    private renderGoogleLoginButton = () => {
        // console.log('rendered google button');
        window.gapi.signin2.render('myg-signin2', this.renderProps);
    };
}

export default GoogleSignIn;

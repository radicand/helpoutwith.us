import * as React from 'react';
import { Helmet } from 'react-helmet';
import { SITE_TITLE } from '../../constants/System';

interface IState {}
interface IProps {}

class NotFound extends React.Component<IProps, IState> {
  public render() {
    return (
      <div>
        <Helmet>
          <title>Not Found - {SITE_TITLE}</title>
        </Helmet>
        <div className="jumbotron">
          <h1 className="display-3">{'404'}</h1>
          <p className="lead">{'We are sorry but the page you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }
}

export default NotFound;

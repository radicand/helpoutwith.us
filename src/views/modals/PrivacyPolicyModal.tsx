import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
  Typography,
  withMobileDialog,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import * as React from 'react';
import { compose } from 'react-apollo';
import { SITE_TITLE } from '../../constants/System';

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
  },
});

export interface IIProps {
  handleClose: () => void;
  isOpen: boolean;
}

type IProps = IIProps & WithStyles<'container'>;

interface IState {}

class PrivacyPolicyModal extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {};
  }

  public render() {
    if (!this.props.isOpen) {
      return null;
    }

    return (
      <Dialog
        open={this.props.isOpen}
        // fullScreen={fullScreen}
        onClose={this.props.handleClose}
        onBackdropClick={this.props.handleClose}
      >
        <React.Fragment>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <p>
                <strong>{SITE_TITLE}</strong> operates helpoutwith.us and may operate other websites. It is {SITE_TITLE}'s
              </p>
            </DialogContentText>
            <DialogContentText>
              <Typography variant="subheading">Website Visitors</Typography>
              <p>
                Like most website operators, {SITE_TITLE} collects non-personally-identifying information of the sort
                that web browsers and servers typically make available, such as the browser type, language preference,
                referring site, and the date and time of each visitor request. {SITE_TITLE}'s purpose in collecting
                non-personally identifying information is to better understand how {SITE_TITLE}'s visitors use its
                website. From time to time, {SITE_TITLE} may release non-personally-identifying information in the
                aggregate, e.g., by publishing a report on trends in the usage of its website.
              </p>
              <p>
                {SITE_TITLE} also collects potentially personally-identifying information like Internet Protocol (IP)
                addresses for logged in users. {SITE_TITLE} only discloses logged in user and IP addresses under the
                same circumstances that it uses and discloses personally-identifying information as described below,
                except that IP addresses and email addresses are visible and disclosed to the administrators of the
                site.
              </p>

              <Typography variant="subheading">Gathering of Personally-Identifying Information</Typography>
              <p>
                Certain visitors to {SITE_TITLE}'s websites choose to interact with {SITE_TITLE} in ways that require{' '}
                {SITE_TITLE} to gather personally-identifying information. The amount and type of information that{' '}
                {SITE_TITLE} gathers depends on the nature of the interaction. For example, we ask visitors who sign up
                at <a href="http://helpoutwith.us/">helpoutwith.us</a> to provide an email address (and name and photo
                via Google or other providers profile data). Those who engage in transactions with {SITE_TITLE} are
                asked to provide additional information, including as necessary the personal and financial information
                required to process those transactions. In each case, {SITE_TITLE} collects such information only
                insofar as is necessary or appropriate to fulfill the purpose of the visitor's interaction with{' '}
                {SITE_TITLE}. {SITE_TITLE} does not disclose personally-identifying information other than as described
                below. And visitors can always refuse to supply personally-identifying information, with the caveat that
                it may prevent them from engaging in certain website-related activities.
              </p>

              <Typography variant="subheading">Aggregated Statistics</Typography>
              <p>
                {SITE_TITLE} may collect statistics about the behavior of visitors to its websites. {SITE_TITLE} may
                display this information publicly or provide it to others. However, {SITE_TITLE} does not disclose
                personally-identifying information other than as described below.
              </p>

              <Typography variant="subheading">Protection of Certain Personally-Identifying Information</Typography>
              <p>
                {SITE_TITLE} discloses potentially personally-identifying and personally-identifying information only to
                those of its employees, contractors and affiliated organizations that (i) need to know that information
                in order to process it on {SITE_TITLE}'s behalf or to provide services available at {SITE_TITLE}'s
                websites, and (ii) that have agreed not to disclose it to others. Some of those employees, contractors
                and affiliated organizations may be located outside of your home country; by using {SITE_TITLE}'s
                websites, you consent to the transfer of such information to them. {SITE_TITLE} will not rent or sell
                potentially personally-identifying and personally-identifying information to anyone. Other than to its
                employees, contractors and affiliated organizations, as described above, {SITE_TITLE} discloses
                potentially personally-identifying and personally-identifying information only in response to a
                subpoena, court order or other governmental request, or when {SITE_TITLE} believes in good faith that
                disclosure is reasonably necessary to protect the property or rights of {SITE_TITLE}, third parties or
                the public at large. If you are a registered user of an {SITE_TITLE} website and have supplied your
                email address, {SITE_TITLE} may occasionally send you an email to tell you about new features, solicit
                your feedback, or just keep you up to date with what's going on with {SITE_TITLE} and our products. If
                you send us a request (for example via email or via one of our feedback mechanisms), we reserve the
                right to publish it in order to help us clarify or respond to your request or to help us support other
                users. {SITE_TITLE} takes all measures reasonably necessary to protect against the unauthorized access,
                use, alteration or destruction of potentially personally-identifying and personally-identifying
                information.
              </p>

              <Typography variant="subheading">Cookies</Typography>
              <p>
                A cookie is a string of information that a website stores on a visitor's computer, and that the
                visitor's browser provides to the website each time the visitor returns. {SITE_TITLE} uses cookies to
                help {SITE_TITLE} identify and track visitors, their usage of {SITE_TITLE} website, and their website
                access preferences. {SITE_TITLE} visitors who do not wish to have cookies placed on their computers
                should set their browsers to refuse cookies before using {SITE_TITLE}'s websites, with the drawback that
                certain features of {SITE_TITLE}'s websites may not function properly without the aid of cookies.
              </p>

              <Typography variant="subheading">Business Transfers</Typography>
              <p>
                If {SITE_TITLE}, or substantially all of its assets, were acquired, or in the unlikely event that{' '}
                {SITE_TITLE} goes out of business or enters bankruptcy, user information would be one of the assets that
                is transferred or acquired by a third party. You acknowledge that such transfers may occur, and that any
              </p>

              <Typography variant="subheading">Ads</Typography>
              <p>
                Ads appearing on any of our websites may be delivered to users by advertising partners, who may set
                cookies. These cookies allow the ad server to recognize your computer each time they send you an online
                advertisement to compile information about you or others who use your computer. This information allows
                ad networks to, among other things, deliver targeted advertisements that they believe will be of most
                interest to you. This Privacy Policy covers the use of cookies by {SITE_TITLE} and does not cover the
                use of cookies by any advertisers.
              </p>

              <Typography variant="subheading">Privacy Policy Changes</Typography>
              <p>
                Although most changes are likely to be minor, {SITE_TITLE} may change its Privacy Policy from time to
                time, and in {SITE_TITLE}'s sole discretion. {SITE_TITLE} encourages visitors to frequently check this
                page for any changes to its Privacy Policy. If you have a helpoutwith.us account, you might also receive
                an alert informing you of these changes. Your continued use of this site after any change in this
                Privacy Policy will constitute your acceptance of such change.
              </p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button size="small" color="primary" onClick={this.props.handleClose}>
              Close
            </Button>
          </DialogActions>
        </React.Fragment>
      </Dialog>
    );
  }
}

export default compose(withStyles(styles, { withTheme: true }), withMobileDialog<IProps>())(PrivacyPolicyModal);

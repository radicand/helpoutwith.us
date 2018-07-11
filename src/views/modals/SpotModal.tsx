import Button from '@material-ui/core/es/Button';
import Checkbox from '@material-ui/core/es/Checkbox';
import Dialog from '@material-ui/core/es/Dialog';
import DialogActions from '@material-ui/core/es/DialogActions';
import DialogContent from '@material-ui/core/es/DialogContent';
import DialogContentText from '@material-ui/core/es/DialogContentText';
import DialogTitle from '@material-ui/core/es/DialogTitle';
import Divider from '@material-ui/core/es/Divider';
import FormControl from '@material-ui/core/es/FormControl';
import FormControlLabel from '@material-ui/core/es/FormControlLabel';
import FormGroup from '@material-ui/core/es/FormGroup';
import Icon from '@material-ui/core/es/Icon';
import Input from '@material-ui/core/es/Input';
import InputLabel from '@material-ui/core/es/InputLabel';
import MenuItem from '@material-ui/core/es/MenuItem';
import Select from '@material-ui/core/es/Select';
import { Theme } from '@material-ui/core/es/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/es/styles/withStyles';
import Switch from '@material-ui/core/es/Switch';
import TextField from '@material-ui/core/es/TextField';
import withMobileDialog from '@material-ui/core/es/withMobileDialog';
import { flatten } from '@typed/list';
import * as luxon from 'luxon';
import { DatePicker, DateTimePicker } from 'material-ui-pickers';
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import * as React from 'react';
import { compose } from 'react-apollo';
import { ReactCookieProps, withCookies } from 'react-cookie';
import {
  CreateSpotMutation,
  MyDataQuery,
  UpdateSpotMutation,
} from '../../queries';
import LoadingComponent from '../components/LoadingComponent';

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 200,
  },
});

interface IState {
  id?: string;
  activityData?: {
    timezone: string;
    id: string;
  };
  numberNeeded?: string;
  startsAt?: luxon.DateTime;
  endsAt?: luxon.DateTime;
  location?: string;
  repeat?: string;
  repeatUntil?: luxon.DateTime;
  repeatSunday?: string;
  repeatMonday?: string;
  repeatTuesday?: string;
  repeatWednesday?: string;
  repeatThursday?: string;
  repeatFriday?: string;
  repeatSaturday?: string;
}

export interface IOProps {
  handleClose: () => void;
  isOpen: boolean;
  timezone: string;
  spot?: {
    id: string;
    activity: {
      id: string;
    };
    numberNeeded: string;
    startsAt: string;
    endsAt: string;
    location?: string;
  };
}

type IIProps = WithStyles<'container' | 'formControl'> & ReactCookieProps;

export type IProps = IOProps & IIProps;

class SpotModal extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    if (props.spot) {
      this.state = {
        id: props.spot.id,
        numberNeeded: props.spot.numberNeeded,
        location: props.spot.location,
        startsAt: luxon.DateTime.fromISO(props.spot.startsAt)
          .setZone(props.timezone, { keepLocalTime: false })
          .setZone('local', { keepLocalTime: true }),
        endsAt: luxon.DateTime.fromISO(props.spot.endsAt)
          .setZone(props.timezone, { keepLocalTime: false })
          .setZone('local', { keepLocalTime: true }),
        activityData: {
          id: props.spot.activity.id,
          timezone: props.timezone,
        },
      };
    } else {
      this.state = {
        location: '',
        activityData: {
          id: '',
          timezone: 'America/Chicago',
        },
        numberNeeded: '1',
        startsAt: luxon.DateTime.local().startOf('hour'),
        endsAt: luxon.DateTime.local()
          .startOf('hour')
          .plus({ hours: 1 }),
        repeat: '',
        repeatUntil: luxon.DateTime.local(),
        repeatSunday: '',
        repeatMonday: '',
        repeatTuesday: '',
        repeatWednesday: '',
        repeatThursday: '',
        repeatFriday: '',
        repeatSaturday: '',
      };
    }
  }

  public render(): JSX.Element {
    const { classes } = this.props;

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
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <DialogTitle>Spot</DialogTitle>
          <DialogContent>
            <DialogContentText />
            <form className={classes.container} autoComplete="off">
              <div>
                {!this.props.spot && (
                  <MyDataQuery>
                    {({ loading, data }) => {
                      if (loading) {
                        return <LoadingComponent />;
                      }

                      return (
                        <FormControl className={classes.formControl}>
                          <InputLabel htmlFor="activity">Activity *</InputLabel>
                          <Select
                            value={JSON.stringify(this.state.activityData)}
                            onChange={this.handleActivityChange}
                            input={<Input name="activity" id="activity" />}
                          >
                            {flatten(
                              data.allOrganizations.map((org) =>
                                org.activities
                                  .filter(
                                    (activity) =>
                                      activity.members.filter(
                                        (member) =>
                                          member.user.id ===
                                            this.props.cookies.get('id') &&
                                          member.role === 'Admin',
                                      ).length !== 0,
                                  )
                                  .map((activity) => (
                                    <MenuItem
                                      key={activity.id}
                                      value={JSON.stringify({
                                        id: activity.id,
                                        timezone: org.timezone,
                                      })}
                                    >
                                      {org.name}: {activity.name}
                                    </MenuItem>
                                  )),
                              ),
                            )}
                          </Select>
                        </FormControl>
                      );
                    }}
                  </MyDataQuery>
                )}
                <FormControl className={classes.formControl}>
                  <TextField
                    required={true}
                    id="name"
                    label="Number of people needed"
                    type="number"
                    value={this.state.numberNeeded}
                    margin="normal"
                    onChange={this.handleChange('numberNeeded')}
                  />
                </FormControl>
                <InputLabel className={classes.formControl}>
                  <DateTimePicker
                    id="startsAt"
                    name="startsAt"
                    label="Starts At"
                    format="MMM dd hh:mm a"
                    disablePast={true}
                    required={true}
                    InputProps={{}}
                    value={this.state.startsAt}
                    onChange={this.handleDateChange('startsAt')}
                    onClear={null}
                    leftArrowIcon={<Icon> keyboard_arrow_left </Icon>}
                    rightArrowIcon={<Icon> keyboard_arrow_right </Icon>}
                  />
                </InputLabel>
                <InputLabel className={classes.formControl}>
                  <DateTimePicker
                    id="endsAt"
                    name="endsAt"
                    label="Ends At"
                    format="MMM dd hh:mm a"
                    disablePast={true}
                    required={true}
                    InputProps={{}}
                    value={this.state.endsAt}
                    onChange={this.handleDateChange('endsAt')}
                    onClear={null}
                    leftArrowIcon={<Icon> keyboard_arrow_left </Icon>}
                    rightArrowIcon={<Icon> keyboard_arrow_right </Icon>}
                  />
                </InputLabel>
                <FormControl className={classes.formControl}>
                  <TextField
                    id="location"
                    label="Location"
                    value={this.state.location}
                    margin="normal"
                    onChange={this.handleChange('location')}
                  />
                </FormControl>
              </div>
              {this.props.spot ? (
                ''
              ) : (
                <div style={{ width: '100%' }}>
                  <Divider />
                  <FormControl className={classes.formControl}>
                    <FormControlLabel
                      control={
                        <Switch
                          id="repeat"
                          value="on"
                          checked={this.state.repeat}
                          onChange={this.handleChange('repeat')}
                        />
                      }
                      label="Repeat Weekly?"
                    />
                  </FormControl>

                  {this.state.repeat ? (
                    <FormGroup row={true}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatSunday}
                            onChange={this.handleChange('repeatSunday')}
                            value="Sunday"
                          />
                        }
                        label="Su"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatMonday}
                            onChange={this.handleChange('repeatMonday')}
                            value="Monday"
                          />
                        }
                        label="M"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatTuesday}
                            onChange={this.handleChange('repeatTuesday')}
                            value="Tuesday"
                          />
                        }
                        label="Tu"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatWednesday}
                            onChange={this.handleChange('repeatWednesday')}
                            value="Wednesday"
                          />
                        }
                        label="W"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatThursday}
                            onChange={this.handleChange('repeatThursday')}
                            value="Thursday"
                          />
                        }
                        label="Th"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatFriday}
                            onChange={this.handleChange('repeatFriday')}
                            value="Friday"
                          />
                        }
                        label="F"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.repeatSaturday}
                            onChange={this.handleChange('repeatSaturday')}
                            value="Saturday"
                          />
                        }
                        label="Sa"
                      />
                    </FormGroup>
                  ) : (
                    ''
                  )}
                  {this.state.repeat ? (
                    <InputLabel className={classes.formControl}>
                      <DatePicker
                        id="repeatUntil"
                        name="repeatUntil"
                        label="Repeat until (inclusive)"
                        format="DD"
                        disablePast={true}
                        required={false}
                        InputProps={{}}
                        value={this.state.repeatUntil}
                        onChange={this.handleDateChange('repeatUntil')}
                        onClear={null}
                        maxDate={this.state.startsAt.plus({ years: 1 })}
                        leftArrowIcon={<Icon> keyboard_arrow_left </Icon>}
                        rightArrowIcon={<Icon> keyboard_arrow_right </Icon>}
                      />
                    </InputLabel>
                  ) : (
                    ''
                  )}
                </div>
              )}
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              color="primary"
              onClick={this.props.handleClose}
            >
              Cancel
            </Button>
            <CreateSpotMutation>
              {(createSpot) => (
                <UpdateSpotMutation>
                  {(updateSpot) => {
                    const _onClickAccept = (
                      event: React.MouseEvent<HTMLButtonElement>,
                    ): void => {
                      event.preventDefault();

                      let numberNeeded: number;
                      try {
                        numberNeeded = parseInt(this.state.numberNeeded, 10);
                      } catch (ex) {
                        // TODO: Pop open a snackbar error and prevent closing.
                        return;
                      }

                      const { repeatUntil } = this.state;
                      const adjustedStartsAt = this.state.startsAt
                        .setZone(this.state.activityData.timezone, {
                          keepLocalTime: true,
                        })
                        .setZone('utc');
                      const adjustedEndsAt = this.state.endsAt
                        .setZone(this.state.activityData.timezone, {
                          keepLocalTime: true,
                        })
                        .setZone('utc');

                      if (this.props.spot) {
                        updateSpot({
                          variables: {
                            id: this.state.id,
                            numberNeeded,
                            startsAt: adjustedStartsAt.toISO(),
                            endsAt: adjustedEndsAt.toISO(),
                            location: this.state.location,
                          },
                        });
                      } else {
                        createSpot({
                          variables: {
                            numberNeeded,
                            startsAt: adjustedStartsAt.toISO(),
                            endsAt: adjustedEndsAt.toISO(),
                            location: this.state.location,
                            activityId: this.state.activityData.id,
                          },
                        });
                      }

                      if (this.state.repeat) {
                        const days: { [key: string]: string } = {
                          Sunday: this.state.repeatSunday,
                          Monday: this.state.repeatMonday,
                          Tuesday: this.state.repeatTuesday,
                          Wednesday: this.state.repeatWednesday,
                          Thursday: this.state.repeatThursday,
                          Friday: this.state.repeatFriday,
                          Saturday: this.state.repeatSaturday,
                        };

                        const duration = luxon.Interval.fromDateTimes(
                          adjustedStartsAt,
                          adjustedEndsAt,
                        ).length('seconds');
                        const range = luxon.Interval.fromDateTimes(
                          adjustedStartsAt,
                          repeatUntil,
                        ).splitBy(luxon.Duration.fromObject({ days: 1 }));

                        range.forEach((interval) => {
                          const baseDate = interval.end.set({
                            hour: adjustedStartsAt.hour,
                            minute: adjustedStartsAt.minute,
                          });
                          const weekdayName = baseDate.weekdayLong;
                          if (days[weekdayName]) {
                            const newVars = {
                              numberNeeded,
                              // the extra setZone is to work around a luxon bug? with the last datetime object
                              // in the range having a local tz and not the UTC one we told it
                              startsAt: baseDate
                                .setZone('utc', { keepLocalTime: true })
                                .toISO(),
                              endsAt: baseDate
                                .plus({ seconds: duration })
                                .setZone('utc', { keepLocalTime: true })
                                .toISO(),
                              location: this.state.location,
                              activityId: this.state.activityData.id,
                            };
                            createSpot({
                              variables: newVars,
                            });
                          }
                        });
                      }

                      this.props.handleClose();
                    };

                    return (
                      <Button
                        size="small"
                        color="primary"
                        onClick={_onClickAccept}
                      >
                        {this.props.spot ? 'Update' : 'Create'}
                      </Button>
                    );
                  }}
                </UpdateSpotMutation>
              )}
            </CreateSpotMutation>
          </DialogActions>
        </MuiPickersUtilsProvider>
      </Dialog>
    );
  }

  private handleChange = (name: string) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.setState({
      [name]:
        event.target.type === 'checkbox'
          ? event.target.checked
            ? event.target.value
            : ''
          : event.target.value,
    });
  };

  private handleActivityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    this.setState({
      activityData: JSON.parse(event.target.value),
    });
  };

  private handleDateChange = (name: string) => (date: luxon.DateTime): void => {
    const baseDate = date.startOf('minute');
    const newState = {
      [name]: baseDate,
    };

    if (name === 'startsAt' && this.state.endsAt < baseDate) {
      newState.endsAt = baseDate;
    } else if (name === 'endsAt' && this.state.startsAt > baseDate) {
      newState.startsAt = baseDate;
    }
    if (name === 'repeatUntil' && this.state.startsAt > baseDate) {
      newState.repeatUntil = this.state.endsAt; // maybe throw error too?
    }

    if (
      name !== 'repeatUntil' &&
      (newState.startsAt || this.state.startsAt) > this.state.repeatUntil
    ) {
      newState.repeatUntil = newState.startsAt || this.state.startsAt;
    }

    this.setState(newState);
  };
}

export default compose(
  withCookies,
  withStyles(styles, { withTheme: true }),
  withMobileDialog<IProps>(),
)(SpotModal);

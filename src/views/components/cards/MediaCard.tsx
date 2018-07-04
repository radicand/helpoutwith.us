import { Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, IconButton, Paper, Typography } from '@material-ui/core';
import { StyleRules, Theme, withStyles } from '@material-ui/core/styles';
import classnamer from 'classnamer';
import * as React from 'react';
import { myData } from '../../../queries/schema';
import { getInitials } from '../../../utils';

type Member =
  | myData['allOrganizations'][0]['members'][0]
  | myData['allOrganizations'][0]['activities'][0]['members'][0]
  | myData['allOrganizations'][0]['activities'][0]['spots'][0]['members'][0];

export interface IMediaCardProps {
  className?: any;
  imageLink?: string;
  imageTitle?: string;
  headline?: string;
  preheader?: string;
  title?: string;
  subheader?: string | JSX.Element;
  bodyText?: string;
  body?: JSX.Element;
  buttons?: Array<{
    text: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }>;
  actions?: Array<{
    label: string;
    icon: JSX.Element;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }>;
  members?: Member[];
  absentMembers?: Member[];
}

const decorate = withStyles((theme: Theme) => {
  const myStyles: StyleRules = {
    card: {
      minWidth: 250,
      maxWidth: 300,
    },
    media: {
      height: 200,
    },
    avatarRow: {
      display: 'flex',
      flexGrow: 1,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    avatar: {
      margin: theme.spacing.unit,
      color: '#fff',
      backgroundColor: theme.palette.secondary.light,
      transition: theme.transitions.create([ 'height', 'width', 'marginBottom' ], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    absent: {
      backgroundColor: 'rgba(255,0,0,.075)',
      width: '100%',
      padding: theme.spacing.unit,
      margin: theme.spacing.unit,
    },
    preheader: {
      marginBottom: 16,
      fontSize: 14,
    },
  };

  return myStyles;
});

const MediaCard = decorate<
  IMediaCardProps
>(
  ({
    className,
    classes,
    imageLink,
    imageTitle,
    headline,
    preheader,
    body,
    bodyText,
    buttons,
    actions,
    title,
    subheader,
    members,
    absentMembers,
  }) => (
    <div>
      <Card className={classnamer(classes.card, className)}>
        {title && <CardHeader title={title} subheader={subheader} />}
        {imageLink && <CardMedia className={classes.media} image={imageLink} title={imageTitle} />}
        <CardContent>
          {preheader && (
            <Typography className={classes.preheader} color="textSecondary">
              {preheader}
            </Typography>
          )}
          {headline && (
            <Typography variant="headline" component="h2">
              {headline}
            </Typography>
          )}
          {!title && subheader && <CardHeader subheader={subheader} />}
          {bodyText && <Typography component="p">{bodyText}</Typography>}
          {body}
          {members && (
            <div className={classes.avatarRow}>
              {members.map((member) => (
                <Avatar
                  key={member.id}
                  aria-label={member.user.name}
                  title={member.user.name}
                  alt={getInitials(member.user.name)}
                  src={member.user.photoLink}
                  className={classes.avatar}
                >
                  {!member.user.photoLink && getInitials(member.user.name)}
                </Avatar>
              ))}
              {absentMembers &&
              absentMembers.length > 0 && (
                <Paper className={classes.absent}>
                  <Typography variant="subheading">Not Available</Typography>
                  {absentMembers.map((member) => (
                    <Avatar
                      key={member.id}
                      aria-label={member.user.name}
                      title={member.user.name}
                      alt={getInitials(member.user.name)}
                      src={member.user.photoLink}
                      className={classes.avatar}
                    >
                      {!member.user.photoLink && getInitials(member.user.name)}
                    </Avatar>
                  ))}
                </Paper>
              )}
            </div>
          )}
        </CardContent>
        {(actions || buttons) && (
          <CardActions>
            {actions &&
              actions.map(({ icon, label, onClick }, index) => (
                <IconButton aria-label={label} key={index} onClick={onClick}>
                  {icon}
                </IconButton>
              ))}
            {buttons &&
              buttons.map(({ text, onClick }, index) => (
                <Button key={index} size="small" color="primary" onClick={onClick}>
                  {text}
                </Button>
              ))}
          </CardActions>
        )}
      </Card>
    </div>
  ),
);

export default MediaCard;

# SafeYT Video Editor
A portable React component for editing YouTube videos

## Installation
1. Create a GitHub Personal Access Token
This component is published to a PBEEJ package repository in GitHub, so you'll need a token to access it. Log in to GitHub.com and click on your profile picture. Click Settings > Developer Settings > Personal access tokens > Tokens (classic). Create a new (classic) token, and grant it the "read:packages" scope.
2. Configure the project for the PBEEJ package repository
Create a `.npmrc` file at the root of the project, and be sure to add it to the `.gitignore`, since it will contain your PAT.
```
@pbeejcom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<insert-github-PAT-here>
always-auth=true
```
3. Install
`yarn add @pbeejcom/safeyt-video-editor@latest`

## Usage
```
import { SafeYTVideoEditor } from '@pbeejcom/safeyt-video-editor';

// ...

<SafeYTVideoEditor 
    width={700} 
    height={400} 
    isEditMode={true} 
    link={link} 
    onSafeYTLinkChange={(link: string) => setOutputLink(link)} />
```
`width`, `height`

Sets the dimensions of the video player (not including the play bar).

`isEditMode`

Sets whether the component is in edit mode (allows creation of skips and bounds) or viewer mode. In viewer mode, no edits are visible to the user, and the bounds are enforced at the call to YouTube. This means that, unlike in edit mode, the YouTube content between the start and end bounds is all that is fetched.

`link`

A YouTube or SafeYT link for viewing or editing.

`onSafeYTLinkChange`

This hook is called by the component whenever the output SafeYT link is changed. You most likely want to pass in a setter in order to keep track of what the SafeYT link is so it can be exported by a user after editing is complete. This hook has little meaning - but can be called nonetheless - when `isEditMode` is `false`.

## Releases
### 2.1.0
- Support fullscreen and airplay integration using native controls. This allows scrubbing through skips.
### 2.0.5
- Reduced the frequency with which `onSafeYTLinkChange` is called to reduce infinite render update issues
### 2.0.0
- Downgrade to React 17 for compatibility with React 17 applications.
### 1.1.0
- Expose YouTube util for consuming components.
### 1.0.2
- Fixed a bug where creating a new skip would open the video bounds for editing, instead of the newly created skip.

## Development

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3030](http://localhost:3030) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
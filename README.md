<a name="top"></a>
# Soft-skills v0.1.0

REST API documentation

 - [Analysis](#Analysis)
   - [Load an analysis data](#Load-an-analysis-data)
   - [Load an analysis data file](#Load-an-analysis-data-file)
   - [Delete an analysis](#Delete-an-analysis)
 - [Authentication](#Authentication)
   - [Login](#Login)
   - [Register](#Register)
 - [Profile](#Profile)
   - [Delete user account](#Delete-user-account)
   - [Edit user profile](#Edit-user-profile)
   - [Get user profile](#Get-user-profile)
 - [Statistics](#Statistics)
   - [Get global platform statistics](#Get-global-platform-statistics)
 - [Uploads](#Uploads)
   - [Edit an upload](#Edit-an-upload)
   - [Retry a previously failed analysis](#Retry-a-previously-failed-analysis)
   - [Upload a file for analysis](#Upload-a-file-for-analysis)
   - [Get the list of all files sent for analysis](#Get-the-list-of-all-files-sent-for-analysis)

___


# <a name='Analysis'></a> Analysis

## <a name='Load-an-analysis-data'></a> Load an analysis data
[Back to top](#top)

```
GET /analysis/:analysisId
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| analysisId | `String` | <p>Analysis id</p> |

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "amplitude": [
      [0.02, 0],
      [0.03, 0]
    ],
    "intensity": [
      [0.02, 0],
      [0.03, 0]
    ],
    "pitch": [
      [0.02, 0],
      [0.03, 0]
    ],
    "_id": "5ede25c1ee17b104bc23ba97",
    "userId": "5eda45b94e213d048bfa7a21",
    "videoFile": "2V4Fne8Z__VIDEO.mp4",
    "audioFile": "2V4Fne8Z__VIDEO.mp4.wav",
    "amplitudePlotFile": "2V4Fne8Z_amplitude.png",
    "intensityPlotFile": "2V4Fne8Z_intensity.png",
    "pitchPlotFile": "2V4Fne8Z_pitch.png",
    "uploadTimestamp": "2020-06-08T11:49:09.080Z",
    "analysisTimestamp": "2020-06-08T11:49:21.577Z"
  }
}
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NotFound | `Error` | <p>Analysis not found.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 404 Not Found
{
  "message": "Analysis not found."
}
```

## <a name='Load-an-analysis-data-file'></a> Load an analysis data file
[Back to top](#top)

```
GET /analysis/:analysis/:file
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| analysisId | `String` | <p>Analysis id</p> |
| file | `String` | <p>Type of data to load - 'videoFile' | 'audioFile' | 'amplitudePlotFile' | 'intensityPlotFile' | 'pitchPlotFile'</p> |

### Examples
Example-usage:

```json
GET /analysis/5ed66cc0dbaee47acd2c1063/amplitude
```

### Success response example

#### Success response example - `Success-Response:`

```File
HTTP/1.1 200 OK
BinaryData
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NotFound | `Error` | <p>Analysis not found.</p> |
| InvalidFileKey | `Error` | <p>Provided file key is invalid</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 404 Not Found
{
  "message": "Analysis not found."
}
```

#### Error response example - `Error-Response:`

```json
HTTP/1.1 400 Bad Request
{
  "message": "Provided file key is invalid."
}
```

## <a name='Delete-an-analysis'></a> Delete an analysis
[Back to top](#top)

<p>Remove the analysis data and the file in the user's uploads list - Accepts analysisId or uploadId</p>

```
DELETE /analysis/:analysisIdOrUploadId
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| analysisIdOrUploadId | `String` | <p>Analysis id</p> |

### Success response example

#### Success response example - `Success-Response:`

```String
HTTP/1.1 200 OK
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NotFound | `Error` | <p>Analysis not found.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 404 Not Found
{
  "message": "Analysis not found."
}
```

# <a name='Authentication'></a> Authentication

## <a name='Login'></a> Login
[Back to top](#top)

```
POST /login
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `String` | <p>email</p> |
| password | `String` | <p>password</p> |

### Parameters examples
`json` - Example usage:

```json
{
  "email": "apidoctest@apidoc.com",
  "password": "secret"
}
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
     "token": "jwtoken123456789",
     "email": "apidoctest@apidoc.com",
     "name": "secret"
  }
}
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InvalidCredentials | `Error` | <p>Invalid email or password.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 401 Unauthorized
{
  "message": "Invalid email or password."
}
```

## <a name='Register'></a> Register
[Back to top](#top)

```
POST /register
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `String` | <p>email</p> |
| name | `String` | <p>name</p> |
| password | `String` | <p>password</p> |

### Parameters examples
`json` - Example usage:

```json
{
  "email": "apidoctest@apidoc.com",
  "name": "apitest",
  "password": "secret"
}
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "email": "apidoctest@apidoc.com",
    "name": "apidoctest"
  }
}
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| UserExist | `Error` | <p>Email already registered.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 409 Conflict
{
  "message": "Could not create the user. Email already registered."
}
```

# <a name='Profile'></a> Profile

## <a name='Delete-user-account'></a> Delete user account
[Back to top](#top)

```
DELETE /profile
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "_id": "5ece75285e8a084208e0b0c4"
  }
}
```

## <a name='Edit-user-profile'></a> Edit user profile
[Back to top](#top)

```
PATCH /profile
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| name | `String` | **optional** <p>name</p> |

### Parameters examples
`json` - Example usage:

```json
{
  "name": "apidoctest2"
}
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "_id": "5ece75285e8a084208e0b0c4",
    "email": "apidoctest@apidoc.com",
    "name": "apidoctest2",
    "joinDate": "2020-05-27T14:11:52.580Z"
  }
}
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NothingToEdit | `Error` | <p>None of the provided keys are editable.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 400 Bad Request
{
  "message": "No profile data to edit."
}
```

## <a name='Get-user-profile'></a> Get user profile
[Back to top](#top)

```
GET /profile
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "_id": "5ece75285e8a084208e0b0c4",
    "email": "apidoctest@apidoc.com",
    "name": "apidoctest",
    "joinDate": "2020-05-27T14:11:52.580Z"
  }
}
```

# <a name='Statistics'></a> Statistics

## <a name='Get-global-platform-statistics'></a> Get global platform statistics
[Back to top](#top)

```
GET /statistics
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "analysesTotalCount": 124,
    "analysesSuccessCount": 112,
    "usersCount": 35
  }
}
```

# <a name='Uploads'></a> Uploads

## <a name='Edit-an-upload'></a> Edit an upload
[Back to top](#top)

<p>Edit an upload name</p>

```
PATCH /uploads/:uploadId
```

### Parameters - `URI`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| uploadId | `String` | <p>Upload id</p> |

### Parameters - `body`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| name | `String` | <p>New upload name</p> |

### Parameters examples
`json` - Example usage:

```json
{
  "name": "Interview 1"
}
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NotFound | `Error` | <p>Analysis not found.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 404 Not Found
{
  "message": "Analysis not found."
}
```

## <a name='Retry-a-previously-failed-analysis'></a> Retry a previously failed analysis
[Back to top](#top)

```
POST /uploads/:uploadId/retry
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| uploadId | `String` | <p>Upload id which analysis' failed</p> |

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "state": "pending",
    "errorMessage": null,
    "analysisId": null,
    "uploadTimestamp": "2020-06-08T11:49:09.080Z",
    "lastStateEditTimestamp": "2020-06-08T11:49:09.080Z",
    "_id": "5ede25b5ee17b104bc23ba96",
    "videoFile": "2V4Fne8Z__VIDEO.mp4"
  }
}
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NotFound | `Error` | <p>Upload not found.</p> |
| NotAnalysisError | `Error` | <p>The upload state is not <code>error</code></p> |
| AlreadyAnalysed | `Error` | <p>This upload was already analysed</p> |
| VideoFileRemoved | `Error` | <p>The video file can't be found or has been removed from the server</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 404 Not Found
{
  "message": "Upload not found."
}
```

#### Error response example - `Error-Response:`

```json
HTTP/1.1 409 Conflict
{
  "message": "You can only retry failed analyses."
}
```

#### Error response example - `Error-Response:`

```json
HTTP/1.1 409 Conflict
{
  "message": "This file has already been analysed."
}
```

#### Error response example - `Error-Response:`

```json
HTTP/1.1 500 Internal Server Error
{
  "message": "The video file was not found on the server. You might want to remove this upload as the file was probably removed from the server."
}
```

## <a name='Upload-a-file-for-analysis'></a> Upload a file for analysis
[Back to top](#top)

```
POST /uploads
```

### Parameters - `Parameter`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| content | `Blob` | <p>File to upload (audio or video)</p> |

### Parameters examples
`Blob` - Example usage:

```Blob
FormData(content: Blob)
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": {
    "state": "pending",
    "analysisId": null,
    "uploadTimestamp": "2020-06-08T11:49:09.080Z",
    "lastStateEditTimestamp": "2020-06-08T11:49:09.080Z",
    "_id": "5ede25b5ee17b104bc23ba96",
    "videoFile": "2V4Fne8Z__VIDEO.mp4"
  }
}
```

### Error response

#### Error response - `Error 4xx`
| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| FileMissing | `Error` | <p>You need to send a file.</p> |
| BadMimeType | `Error` | <p>You need to send a video file.</p> |

### Error response example

#### Error response example - `Error-Response:`

```json
HTTP/1.1 400 Bad Request
{
  "message": "You need to send a file."
}
```

#### Error response example - `Error-Response:`

```json
HTTP/1.1 400 Bad Request
{
  "message": "You need to send a video file."
}
```

## <a name='Get-the-list-of-all-files-sent-for-analysis'></a> Get the list of all files sent for analysis
[Back to top](#top)

<p>Files are sorted by uploadTimestamp desc.</p>

```
GET /uploads
```

### Success response example

#### Success response example - `Success-Response:`

```json
HTTP/1.1 200 OK
{
  "data": [
    {
        "state": "pending",
        "analysisId": "5edfa469b0996303bfac4054",
        "uploadTimestamp": "2020-06-09T15:01:42.886Z",
        "lastStateEditTimestamp": "2020-06-09T15:02:01.479Z",
        "_id": "5edfa456b0996303bfac4053",
        "videoFile": "3x46l715_upload.webm"
    },
    {
        "state": "error",
        "errorMessage": "Command failed with exit code 1: pytho...",
        "analysisId": "5edf9fceb0996303bfac4052",
        "uploadTimestamp": "2020-06-09T14:42:05.643Z",
        "lastStateEditTimestamp": "2020-06-09T14:42:22.244Z",
        "_id": "5edf9fbdb0996303bfac4051",
        "videoFile": "2uLgBYY0_upload.webm"
    },
    {
        "state": "finished",
        "analysisId": "5edf9873b0996303bfac4050",
        "uploadTimestamp": "2020-06-09T14:10:28.124Z",
        "lastStateEditTimestamp": "2020-06-09T14:11:00.153Z",
        "_id": "5edf9854b0996303bfac404f",
        "videoFile": "1lg55iA7_upload.webm"
    }
  ]
}
```

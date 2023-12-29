use windows::{
    core::Error as WindowsError,
    Media::Control::GlobalSystemMediaTransportControlsSessionManager, Storage::Streams::{IRandomAccessStreamReference, Buffer, InputStreamOptions, DataReader}, 
};

use tauri::{
    plugin::{
        Builder, 
        TauriPlugin
    },
    Runtime,
};

use crate::types::structs::Media;

async fn get_current_media_session() -> Result<Media, WindowsError> {
    let media_session_manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?.await?;
    match media_session_manager.GetCurrentSession() {
        Ok(current_session) => {
            let properties = current_session.TryGetMediaPropertiesAsync()?.await?;
            let media = Media {
                title: properties.Title()?.to_string_lossy(),
                artist: properties.Artist()?.to_string_lossy(),
                // TODO: Get actual thumbnail
                // thumbnail: None,
                thumbnail: Some(get_thumbnail(properties.Thumbnail()?).await?),
            };
            return Ok(media)
        }
        Err(err) => {Err(err)}
    }
}

async fn get_all_media_sessions() -> Result<Vec<Media>, WindowsError> {
    let media_session_manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?.await?;
    let mut medias:Vec<Media> = Vec::new();
    match media_session_manager.GetSessions() {
        Ok(sessions) => {
            for session in sessions.into_iter() {
                let properties = session.TryGetMediaPropertiesAsync()?.await?;
                let media = Media {
                    title: properties.Title()?.to_string_lossy(),
                    artist: properties.Artist()?.to_string_lossy(),
                    // TODO: Get actual thumbnail
                    thumbnail: None,
                };
                medias.push(media);
            }
        }
        Err(err) => {return Err(err);}
    }
    return Ok(medias);
}

async fn get_thumbnail(thumbnail_ref:IRandomAccessStreamReference) -> Result<Vec<u8>, WindowsError> {
    let read_operation  = thumbnail_ref.OpenReadAsync()?;
    let read_stream = read_operation.await?;
    let buffer_size = read_stream.Size()? as u32;
    let buffer = Buffer::Create(buffer_size)?;
    let read_buffer = read_stream.ReadAsync(&buffer, buffer_size, InputStreamOptions::None)?.await?;
    let reader = DataReader::FromBuffer(&read_buffer)?;
    let length = reader.UnconsumedBufferLength()? as usize;
    let mut bytes = vec![0u8; length];
    reader.ReadBytes(&mut bytes)?;
    return Ok(bytes);
}



pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("media")
        .build()
}

#[cfg(test)]
mod test {
    use crate::setup_logging;
    use super::*;
    use tokio;

    fn setup_test() {
        let _ = setup_logging();
    }

    #[tokio::test]
    async fn test_get_current_media_session() -> Result<(), WindowsError> {
        setup_test();
        match get_current_media_session().await {
            Ok(media) => {
                log::info!("Media: {:?}", media);
                Ok(())
            }
            Err(e) => {Err(e)}
        }
    }

    #[tokio::test]
    async fn test_get_all_media_sessions() -> Result<(), WindowsError> {
        setup_test();
        match get_all_media_sessions().await {
            Ok(medias) => {
                log::info!("Medias: {:?}", medias);
                Ok(())
            }
            Err(e) => {Err(e)}
        }
    }

    // OMEGA DONT RUN THIS TEST SHTI GONNA CRASH VS CODE
    #[tokio::test]
    async fn get_thumbnail() -> Result<(), WindowsError> {
        setup_test();
        match get_current_media_session().await {
            Ok(media) => {
                log::info!("Thumbnail {:?}", media.thumbnail);
                Ok(())
            }
            Err(e) => {Err(e)}
        }
    }
 }
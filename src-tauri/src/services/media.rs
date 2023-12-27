use windows::{
    core::Error as WindowsError,
    Media::Control::GlobalSystemMediaTransportControlsSessionManager, 
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
                thumbnail: None,
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
            Ok(_) => {Ok(())}
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
 }
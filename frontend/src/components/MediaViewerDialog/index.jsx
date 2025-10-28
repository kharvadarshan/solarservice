"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"

export function MediaViewerDialog({ open, onOpenChange, mediaUrl, mediaType, title }) {
  const handleDownload = async () => {
    try {
      // Extract filename from the stored URL
      const filename = mediaUrl.split('/').pop()
      
      // Use your API endpoint for download
      const downloadUrl = `http://localhost:5000/api/uploads/${filename}`
      
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title}-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  // Convert stored file path to API URL for display
  const getDisplayUrl = () => {
    if (mediaUrl.startsWith('file://') || mediaUrl.includes('uploads/')) {
      const filename = mediaUrl.split('/').pop()
      return `http://localhost:5000/api/uploads/${filename}`
    }
    return mediaUrl
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            View and download the {mediaType === 'image' ? 'image' : 'video'} file
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {mediaType === "image" ? (
            <img src={getDisplayUrl() || "/placeholder.svg"} alt={title} className="w-full h-auto rounded-lg" />
          ) : (
            <video src={getDisplayUrl()} controls className="w-full h-auto rounded-lg">
              Your browser does not support the video tag.
            </video>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// "use client"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
// import { Button } from "../../components/ui/button"

// export function MediaViewerDialog({ open, onOpenChange, mediaUrl, mediaType, title }) {
//   const handleDownload = async () => {
//     try {
//       const response = await fetch(mediaUrl)
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = `${title}-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`
//       document.body.appendChild(a)
//       a.click()
//       window.URL.revokeObjectURL(url)
//       document.body.removeChild(a)
//     } catch (error) {
//       console.error("Download failed:", error)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           {mediaType === "image" ? (
//             <img src={mediaUrl || "/placeholder.svg"} alt={title} className="w-full h-auto rounded-lg" />
//           ) : (
//             <video src={mediaUrl} controls className="w-full h-auto rounded-lg">
//               Your browser does not support the video tag.
//             </video>
//           )}
//           <div className="flex justify-end gap-2">
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Close
//             </Button>
//             <Button onClick={handleDownload}>
//               <svg
//                 className="w-4 h-4 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                 />
//               </svg>
//               Download
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
function saveCanvasWithWatermark() {

		const canvas = window.renderer.domElement;
		const imageUrl = canvas.toDataURL('image/png');
		// Create a new Image element for the watermark
		const watermarkImage = new Image();
		watermarkImage.src = 'images/watermark.png'; // Replace 'watermark.png' with the path to your watermark image
		watermarkImage.onload = function() {
		    const canvasWithWatermark = document.createElement('canvas');
		    const ctx = canvasWithWatermark.getContext('2d');
		    // Set the canvas size to match the original canvas
		    canvasWithWatermark.width = canvas.width;
		    canvasWithWatermark.height = canvas.height;
		    // Draw the original image onto the new canvas
		    ctx.drawImage(canvas, 0, 0);
		    // Draw the watermark image on top
		    ctx.drawImage(watermarkImage, 0, 0);
		    // Convert the canvas with the watermark to a data URL
		    const finalImageUrl = canvasWithWatermark.toDataURL('image/png');
		    // Create a download link for the final image
		    const link = document.createElement('a');
		    link.download = 'mielniczuk-fluids-with-watermark.png';
		    link.href = finalImageUrl;
		    link.click();
		};

}


function setupFlow() {
	
	document.getElementById('playPauseButton').addEventListener('click', function() {
	    if (window.isAnimationActive) {
	        window.controlAnimation(false);
	        this.textContent = 'Play';
	    } else {
	        window.controlAnimation(true);
	        this.textContent = 'Pause';
	    }
	});

	document.getElementById("logo").addEventListener('click', ()=> {
		saveCanvasWithWatermark()
	})

    // Add event listeners for keydown events
    document.addEventListener('keydown', function(event) {
    		
    		if(window.profileModal == true) return;

        if (event.key === 'p' || event.key === 'P') {
            // Pause/play when 'P' key is pressed
            if (window.isAnimationActive) {
                window.controlAnimation(false);
                document.getElementById('playPauseButton').textContent = 'Play';
            } else {
                window.controlAnimation(true);
                document.getElementById('playPauseButton').textContent = 'Pause';
            }
        } else if (event.key === 's' || event.key === 'S') {
            // Save when 'S' key is pressed
            saveCanvasWithWatermark();
        }
    });

}


document.addEventListener('DOMContentLoaded', () => {
    setupFlow()
});

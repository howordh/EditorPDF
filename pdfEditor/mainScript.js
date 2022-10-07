	const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib  
	
	let pdfDoc;
	let pdfDocs_any = [];

	const dropZone = document.querySelector(".dropZone div");
	const input = document.getElementById('file');		
	const list_input = document.getElementById('list_input');
	const work = document.querySelector('.workBlock');
	const inputImage = document.getElementById('addImage');	
	
		
	document.addEventListener("dragover", (ev) => ev.preventDefault());
	document.addEventListener("drop", (ev) => ev.preventDefault());
		
	
	dropZone.addEventListener("drop", (ev) => 
	{
		ev.preventDefault();
		let filep = ev.dataTransfer.files[0];		
		let reader = new FileReader();
		reader.readAsArrayBuffer(filep);	
		reader.onload = async () => 
		{
			try
			{
				if (pdfDocs_any.length == 0)
				{
					pdfDoc = await PDFDocument.load(reader.result); 				
					await saveAndRender(pdfDoc);										
					pdfDocs_any.push(pdfDoc);
				}
				else
				{
					let doc = await PDFDocument.load(reader.result);
					let pdfBytes = await doc.save();
					pdfDocs_any.push(doc); 												
				}				
									
				let new_elem = document.createElement("li");	
				new_elem.value = pdfDocs_any.length;				
				new_elem.textContent = filep.name;		
				new_elem.addEventListener("click", async(ev) => 
				{
					let val = ev.target.value; 
					document.getElementById('lbl').innerHTML = val;
					pdfDoc = pdfDocs_any[val - 1];					
					await saveAndRender(pdfDoc);
				});
				list_input.append(new_elem);						
			}
			catch (err)
			{
				alert('dropZone.addEventListener(drop): ' + err.message);
			}
		};			
	});
		
	dropZone.addEventListener("click", () => 
	{
		input.click();
	});
	
	input.addEventListener("change", (ev) => 
	{	
		let filep = ev.target.files[0];
		let reader = new FileReader();
		reader.readAsArrayBuffer(filep);	
		reader.onload = async () => 
		{
			try
			{
				if (pdfDocs_any.length == 0)
				{
					pdfDoc = await PDFDocument.load(reader.result); 				
					await saveAndRender(pdfDoc);										
					pdfDocs_any.push(pdfDoc);
				}
				else
				{
					let doc = await PDFDocument.load(reader.result);
					let pdfBytes = await doc.save();
					pdfDocs_any.push(doc); 												
				}				
						
				document.getElementById('lbl').innerHTML = pdfDocs_any.length;
						
				let new_elem = document.createElement("li");	
				new_elem.value = pdfDocs_any.length;				
				new_elem.textContent = filep.name;		
				new_elem.addEventListener("click", async(ev) => 
				{
					let val = ev.target.value; 
					document.getElementById('lbl').innerHTML = val;
					pdfDoc = pdfDocs_any[val - 1];					
					await saveAndRender(pdfDoc);
				});
				list_input.append(new_elem);								
			}
			catch (err)
			{
				alert('input.addEventListener(change)' + err.message);
			}
		};			
	});				

	inputImage.addEventListener("change", (ev) => 
	{	
		const files =  ev.target.files;
		const pageIndex = Number(document.getElementById('pageInsertImg').value);
		const pageCount = pdfDoc.getPageCount();	
		
		if (files.length > 0 && pageIndex > 0 && pageIndex <= pageCount)
		{
			let reader = new FileReader();
			reader.readAsArrayBuffer(files[0]);	
			reader.onload = async () => 
			{
				pdfDoc = await addPictureToPage(pdfDoc, pageIndex - 1, reader.result); 
				pdfDoc = await saveAndRender(pdfDoc);
				inputImage.value = null;
			};									
		}
	});
	
	document.querySelector('.headImage').addEventListener("click", () => 
	{
		alert('Разработчик: студент группы ПО-11м Поляков Д.М.');
	});
	
	
		
	async function loadPdf() 
	{ 
		const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf' 
		const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
     	return await PDFDocument.load(existingPdfBytes)
	}

	async function addPageToDoc(doc) 
	{
		const page = doc.addPage();
		const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
		const { width, height } = page.getSize();
		const fontSize = 30;
		//page.drawText('Adding a page in JavaScript is awesome!', 
		//{
		//	x: 50,
		//	y: height - 4 * fontSize,
		//	size: fontSize,
		//	font: timesRomanFont,
		//	color: rgb(0, 0.53, 0.71)
		//});
		return doc;  
	} 

	async function removePageToDoc(doc, index) 
	{ 
		//const totalPages = doc.getPageCount()  
		doc.removePage(index);
		return doc;  
	}  
		
	async function saveAndRender(doc) 
	{ 
		try
		{
			const pdfBytes = await doc.save();  
			const pdfDataUri = await doc.saveAsBase64({ dataUri: true });  
			document.getElementById('pdf').src = pdfDataUri;  
			return doc;
		}
		catch (err)
		{
			alert('saveAndRender' + err.message);			
		}
	}  
		
	async function joinAnyDocs(...args)
	{
		try
		{			
			document.getElementById('lbl').innerHTML = args.length;	
			let newPdfDoc = await PDFDocument.create();		
			
			for (let i = 0; i < args.length; i++)
			{						
				let count = args[i].getPageCount();									
				for (let j = 0; j < count; j++)
				{				
					let copiedPages = await newPdfDoc.copyPages(args[i], [j]);
					let [page] = copiedPages;
					newPdfDoc.addPage(page);
				}				
			}
			return newPdfDoc;  
		}
		catch (err)
		{
			alert('joinAnyDocs ' + err.message);			
		}
	}
		
	async function separatePagesFromDoc(doc, ...args)
	{
		try
		{						
			document.getElementById('lbl').innerHTML = args.length;
			let newPdfDoc = await PDFDocument.create();	
			
			for (let i = 0; i < args.length; i++)
			{	
				let copiedPages = await newPdfDoc.copyPages(doc, [args[i]]);
				let [page] = copiedPages;				
				newPdfDoc.addPage(page);
			}	
			
			return newPdfDoc;  
		}
		catch (err)
		{
			alert('separatePagesFromDoc ' + err.message);			
		}
	}
		
	async function addNumbersPageToDoc(doc, firstPageIndex, firstIndex)
	{
		try
		{
			const courierBoldFont = await doc.embedFont(StandardFonts.Courier);
			const pageCount = doc.getPageCount();			

			const pages = doc.getPages();
			
			for (let pageIndex = 0; pageIndex < (pageCount - firstPageIndex); pageIndex++)
			{				
				let page = pages[pageIndex + firstPageIndex];				
				//document.getElementById('lbl').innerHTML =  pageIndex + firstPageIndex;				
				const number = String(Number(pageIndex) + Number(firstIndex));			
				page.drawText(number,
				{
					x: page.getWidth() / 2,
					y: 20,
					font: courierBoldFont,
					size: 12
				});		
			}
			
			
			return doc;
		}		
		catch (err)
		{
			alert('addNumbersPageToDoc ' + err.message);
		}
	}
		
	async function addPictureToPage(doc, pageIndex, picture)
	{
		try
		{					
			let pages = doc.getPages();			
			let page = pages[pageIndex];			
				
			let img = await doc.embedJpg(picture);

			//document.getElementById('lbl').innerHTML = picture;
			
			const { width, height } = img.scale(1);
			await page.drawImage(img, 
			{
				x: page.getWidth() / 2 - width / 2,
				y: page.getHeight() / 2 - height / 2
			});		
			return doc;			
		}		
		catch (err)
		{
			alert('addPictureToPage ' + err.message);
		}
	}
		
		
		
		
	async function addPage() 
	{  
		pdfDoc = await addPageToDoc(pdfDoc);  
		pdfDoc = await saveAndRender(pdfDoc);  
	}  
		
	async function removePage() 
	{ 
		const pageIndex = Number(document.getElementById('pageDel').value);
		const totalPages = pdfDoc.getPageCount()
		if (pageIndex <= totalPages && pageIndex > 0)
		{		
			pdfDoc = await removePageToDoc(pdfDoc, pageIndex - 1);  
			pdfDoc = await saveAndRender(pdfDoc);
		}
	}
	
	async function saveDoc()
	{
		const pdfBytes = await pdfDoc.save();  
		download(pdfBytes, "FileChanged.pdf", "application/pdf");
	}

	async function joinDocs()
	{
		pdfDoc = await joinAnyDocs(...pdfDocs_any);
		pdfDoc = await saveAndRender(pdfDoc);
		
		pdfDocs_any.length = 0;
		pdfDocs_any.push(pdfDoc);
		
		list_input.innerHTML = '';
		let new_elem = document.createElement("li");	
		new_elem.value = pdfDocs_any.length;				
		new_elem.textContent = "ChangedFile.pdf";		
		new_elem.addEventListener("click", async(ev) => 
		{
			let val = ev.target.value; 
			document.getElementById('lbl').innerHTML = val;
			pdfDoc = pdfDocs_any[val - 1];					
			pdfDoc = await saveAndRender(pdfDoc);
		});
		list_input.append(new_elem);	

					
	}

	async function separateDoc()
	{		
		const iBegin = document.getElementById('intervalBegin').value;
		const iEnd = document.getElementById('intervalEnd').value;
		const pageCount = pdfDoc.getPageCount();
							
		if (iBegin <= iEnd && iBegin > 0 && iEnd <= pageCount && pageCount > 1)
		{			
			let interval = [];
			for (let i = iBegin; i <= iEnd; i++)
				interval.push(i - 1);
			
			 interval;
		
			pdfDoc = await separatePagesFromDoc(pdfDoc, ...interval);  
			
			pdfDoc = await saveAndRender(pdfDoc);
		
			pdfDocs_any.push(pdfDoc);
		
			let new_elem = document.createElement("li");	
			new_elem.value = pdfDocs_any.length;				
			new_elem.textContent = "ChangedFile.pdf";	
			new_elem.addEventListener("click", async(ev) => 
			{
				let val = ev.target.value; 
				document.getElementById('lbl').innerHTML = val;
				pdfDoc = pdfDocs_any[val - 1];					
				pdfDoc = await saveAndRender(pdfDoc);
			});
			list_input.append(new_elem);	
		}
	}
	
	async function addNumbers()
	{
		const pageBeginIndex = Number(document.getElementById('pageBegin').value);
		const indexBegin = Number(document.getElementById('indexBegin').value);
		const pageCount = pdfDoc.getPageCount();
		
		if (pageBeginIndex <= pageCount && pageBeginIndex > 0)
		{
			pdfDoc = await addNumbersPageToDoc(pdfDoc, pageBeginIndex - 1, indexBegin);  
			pdfDoc = await saveAndRender(pdfDoc);
		}
	}

	async function addPicture()
	{			
		inputImage.click();		
	}

	//loadPdf().then((doc) => 
	//{
	//	pdfDoc = doc;  	
	//	return saveAndRender(pdfDoc);
	//});
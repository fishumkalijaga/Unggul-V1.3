/* Minimal browser-native DOCX generator (Office Open XML stored in a valid ZIP).
   No CDN, external JS library, backend, or account required. Copyright © [2026] ramalabs. */
(function () {
  'use strict';
  const encoder=new TextEncoder();
  const x=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const crcTable=new Uint32Array(256);
  for(let n=0;n<256;n++){
    let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;
    crcTable[n]=c>>>0;
  }
  function crc32(bytes){let crc=0xFFFFFFFF;for(let i=0;i<bytes.length;i++)crc=crcTable[(crc^bytes[i])&255]^(crc>>>8);return (crc^0xFFFFFFFF)>>>0;}
  function zip(files){
    const parts=[],central=[];let offset=0;
    const u16=(v)=>[v&255,(v>>>8)&255];
    const u32=(v)=>[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];
    const append=(target,bytes)=>{target.push(bytes);};
    for(const [path,content] of files){
      const name=encoder.encode(path),data=encoder.encode(content),crc=crc32(data);
      const local=new Uint8Array([0x50,0x4b,0x03,0x04,...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)]);
      append(parts,local);append(parts,name);append(parts,data);
      const header=new Uint8Array([0x50,0x4b,0x01,0x02,...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
      append(central,header);append(central,name);
      offset+=local.length+name.length+data.length;
    }
    const centralBytes=central.reduce((n,a)=>n+a.length,0);
    const end=new Uint8Array([0x50,0x4b,0x05,0x06,...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralBytes),...u32(offset),...u16(0)]);
    return new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  }
  const p=(text,style='Normal')=>`<w:p><w:pPr><w:pStyle w:val="${style}"/><w:spacing w:after="110" w:line="315" w:lineRule="auto"/></w:pPr><w:r>${String(text??'').split(/\r?\n/).map((line,i)=>(i?'<w:br/>':'')+`<w:t xml:space="preserve">${x(line)}</w:t>`).join('')}</w:r></w:p>`;
  function row(cells,widths,header=false){
    const tc=cells.map((cell,index)=>`<w:tc><w:tcPr><w:tcW w:w="${widths[index]}" w:type="dxa"/><w:shd w:fill="${header?'E9F4F3':'FFFFFF'}"/><w:tcMar><w:top w:w="95" w:type="dxa"/><w:start w:w="100" w:type="dxa"/><w:bottom w:w="95" w:type="dxa"/><w:end w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/>${header?'<w:b/>':''}</w:rPr><w:t xml:space="preserve">${x(cell)}</w:t></w:r></w:p></w:tc>`).join('');
    return `<w:tr>${header?'<w:trPr><w:tblHeader w:val="true"/></w:trPr>':''}${tc}</w:tr>`;
  }
  function tbl(heads,rows){
    const widths=heads.length===2?[3000,6400]:heads[0]==='Pertanyaan konsep'?[4400,3400,1600]:heads[0]==='Indikator'&&heads[1]==='Hasil'?[2400,1800,5200]:[3000,3200,3200];
    const grid=widths.map(width=>`<w:gridCol w:w="${width}"/>`).join('');
    return `<w:tbl><w:tblPr><w:tblW w:w="9400" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D6E5E8"/><w:left w:val="single" w:sz="4" w:color="D6E5E8"/><w:bottom w:val="single" w:sz="4" w:color="D6E5E8"/><w:right w:val="single" w:sz="4" w:color="D6E5E8"/><w:insideH w:val="single" w:sz="4" w:color="D6E5E8"/><w:insideV w:val="single" w:sz="4" w:color="D6E5E8"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${heads?row(heads,widths,true):''}${rows.map(r=>row(r,widths)).join('')}</w:tbl>`;
  }
  function docx(model){
    const body=[];
    body.push(p('RAMALABS  /  UNGGUL PREDICTION','Label'));
    body.push(p(model.title,'Title'));
    body.push(p(model.subtitle,'Subtitle'));
    body.push(p('METADATA LAPORAN','Heading1'));
    body.push(tbl(['Informasi','Keterangan'],model.meta));
    for(const section of model.sections){
      body.push(p(section.heading,'Heading1'));
      for(const paragraph of section.paragraphs||[])body.push(p(paragraph));
      for(const bullet of section.bullets||[])body.push(p('• '+bullet));
      if(section.table)body.push(tbl(section.table.heads,section.table.rows));
    }
    const document=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body.join('')}<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/><w:color w:val="304A5A"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="39"/><w:color w:val="143349"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="20"/><w:color w:val="718796"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="220" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="158E7E"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Label"><w:name w:val="Label"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="159A85"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Small"><w:name w:val="Small"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="17"/><w:color w:val="758796"/></w:rPr></w:style></w:styles>`;
    const files=[
      ['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`],
      ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`],
      ['word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`],
      ['word/styles.xml',styles],['word/document.xml',document],
      ['word/footer1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="758796"/><w:sz w:val="16"/></w:rPr><w:t>${x(model.copyright)}</w:t></w:r></w:p></w:ftr>`],
      ['docProps/core.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(model.title)}</dc:title><dc:creator>ramalabs</dc:creator><dc:description>Laporan penilaian dan telaah asesmen kecukupan FED</dc:description></cp:coreProperties>`],
      ['docProps/app.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>RAMALABS Unggul Prediction</Application></Properties>`]
    ];
    return zip(files);
  }
  window.RamalabsDocx=docx;
})();

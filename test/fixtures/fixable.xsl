<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:unused="urn:unused" version="2.0">
  <xsl:template match="child::book">
    <xsl:value-of select="title"/>
  </xsl:template>
</xsl:stylesheet>

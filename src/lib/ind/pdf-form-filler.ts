//@ts-nocheck
// Optimized PDF Form Filler with caching and faster loading strategies
import { StandardFonts, PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, rgb } from 'pdf-lib';
import { PLACEHOLDER_DICTIONARY, CHECKBOX_FIELD_MAPPINGS } from './placeholder-dictionary';

export interface PDFFormData {
  [fieldName: string]: any;
}

interface CachedPDFData {
  pdfDoc: PDFDocument;
  form: PDFForm;
  fieldMap: Map<string, any>;
  textFields: PDFTextField[];
  timestamp: number;
  hash: string;
}

interface LoadingStrategy {
  name: string;
  options: any;
  priority: number;
}

export class EnhancedPDFFormFiller {
  // In-memory cache for loaded PDFs (with size limit to prevent memory leaks)
  private static pdfCache = new Map<string, CachedPDFData>();
  private static readonly MAX_CACHE_SIZE = 10;
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private static matchCache = new Map<string, { dataKey: string; fieldConfig: any } | null>();

  // Optimized loading strategies in order of preference (fastest first)
  private static readonly LOADING_STRATEGIES: LoadingStrategy[] = [
    {
      name: 'ultra-fast',
      options: {
        ignoreEncryption: true,
        updateMetadata: false,
        parseSpeed: Infinity,
        throwOnInvalidObject: false,
        capNumbers: false,
        parseComplexObjects: false,
        ignoreEOF: true
      },
      priority: 1
    },
    {
      name: 'fast',
      options: {
        ignoreEncryption: true,
        updateMetadata: false,
        parseSpeed: 1500,
        throwOnInvalidObject: false,
        capNumbers: false
      },
      priority: 2
    },
    {
      name: 'conservative',
      options: {
        ignoreEncryption: true,
        updateMetadata: false,
        parseSpeed: 500,
        throwOnInvalidObject: false
      },
      priority: 3
    }
  ];

  /**
   * Generate a fast hash for PDF bytes for caching
   */
  private static generatePDFHash(pdfBytes: Uint8Array): string {
    // Use a simple but fast hash based on file size, first/last bytes, and sample bytes
    const size = pdfBytes.length;
    const first = pdfBytes[0] || 0;
    const last = pdfBytes[size - 1] || 0;
    
    // Sample bytes from strategic positions for better uniqueness
    let hash = size ^ first ^ (last << 8);
    
    // Sample a few bytes from different positions
    const samplePositions = [
      Math.floor(size * 0.1),
      Math.floor(size * 0.3),
      Math.floor(size * 0.5),
      Math.floor(size * 0.7),
      Math.floor(size * 0.9)
    ];
    
    samplePositions.forEach((pos, i) => {
      if (pos < size) {
        hash ^= (pdfBytes[pos] << (i * 4));
      }
    });
    
    return hash.toString(36);
  }

  /**
   * Clean expired entries from cache
   */
  private static cleanCache(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    this.pdfCache.forEach((cached, key) => {
      if (now - cached.timestamp > this.CACHE_TTL) {
        entriesToDelete.push(key);
      }
    });
    
    entriesToDelete.forEach(key => {
      this.pdfCache.delete(key);
      console.log(`🗑️ Removed expired cache entry: ${key}`);
    });
  }

  /**
   * Manage cache size to prevent memory leaks
   */
  private static manageCacheSize(): void {
    if (this.pdfCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries first (simple LRU)
      const entries = Array.from(this.pdfCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE + 1);
      toRemove.forEach(([key]) => {
        this.pdfCache.delete(key);
        console.log(`🗑️ Removed old cache entry to manage size: ${key}`);
      });
    }
  }

  /**
   * Load PDF with optimized strategies and caching
   */
  private static async loadPDFWithCache(pdfBytes: Uint8Array): Promise<CachedPDFData> {
    console.log('🚀 Loading PDF with optimization and caching...');
    
    // Generate hash for caching
    const pdfHash = this.generatePDFHash(pdfBytes);
    
    // Clean expired cache entries
    this.cleanCache();
    
    // Check cache first
    const cached = this.pdfCache.get(pdfHash);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('⚡ Cache HIT! Using cached PDF data');
      return cached;
    }
    
    console.log('💾 Cache MISS - Loading PDF fresh');
    
    // Validate PDF bytes
    if (!pdfBytes || pdfBytes.length === 0) {
      throw new Error('Invalid PDF: empty or null bytes');
    }

    // Quick header validation
    const header = new TextDecoder('latin1').decode(pdfBytes.slice(0, 8));
    if (!header.includes('%PDF')) {
      throw new Error('Invalid PDF: missing PDF header');
    }

    let pdfDoc: PDFDocument | undefined;
    const loadingTime = Date.now();
    
    // Try loading strategies in order of speed
    for (const strategy of this.LOADING_STRATEGIES) {
      try {
        console.log(`⚡ Trying ${strategy.name} loading strategy...`);
        const startTime = Date.now();
        
        pdfDoc = await PDFDocument.load(pdfBytes, strategy.options);
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ PDF loaded successfully with ${strategy.name} strategy in ${loadTime}ms`);
        break;
        
      } catch (error) {
        console.warn(`❌ ${strategy.name} strategy failed:`, (error as Error).message);
        if (strategy === this.LOADING_STRATEGIES[this.LOADING_STRATEGIES.length - 1]) {
          throw new Error(`All loading strategies failed. Last error: ${(error as Error).message}`);
        }
      }
    }

    if (!pdfDoc) {
      throw new Error('Failed to load PDF with any strategy');
    }

    // Pre-process and cache form data for faster access
    let form: PDFForm;
    let fieldMap: Map<string, any>;
    let textFields: PDFTextField[];
    
    try {
      console.log('📋 Pre-processing form fields...');
      const processingStart = Date.now();
      
      form = pdfDoc.getForm();
      const allFields = form.getFields();
      
      // Build optimized field map
      fieldMap = new Map();
      textFields = [];
      
      allFields.forEach(field => {
        const name = field.getName();
        if (name) {
          fieldMap.set(name, field);
          fieldMap.set(name.toLowerCase(), field); // Add lowercase version for faster lookup
        }
        
        if (field instanceof PDFTextField) {
          textFields.push(field);
        }
      });
      
      const processingTime = Date.now() - processingStart;
      console.log(`📋 Form preprocessing completed in ${processingTime}ms (${allFields.length} fields)`);
      
    } catch (formError) {
      throw new Error(`Cannot access form fields: ${(formError as Error).message}`);
    }

    // Create cached data
    const cachedData: CachedPDFData = {
      pdfDoc,
      form,
      fieldMap,
      textFields,
      timestamp: Date.now(),
      hash: pdfHash
    };

    // Manage cache size before adding new entry
    this.manageCacheSize();
    
    // Store in cache
    this.pdfCache.set(pdfHash, cachedData);
    console.log(`💾 PDF cached with hash: ${pdfHash}`);
    console.log(`📊 Cache status: ${this.pdfCache.size}/${this.MAX_CACHE_SIZE} entries`);

    const totalTime = Date.now() - loadingTime;
    console.log(`🏁 Total loading and processing time: ${totalTime}ms`);

    return cachedData;
  }

  /**
   * Main form filling method with optimized loading
   */
  static async fillPDFFormFields(
    pdfBytes: Uint8Array,
    documentType: string,
    formData: PDFFormData
  ): Promise<Uint8Array> {
    console.log('=== OPTIMIZED PDF FORM FILLING ===');
    console.log('Document type:', documentType);
    console.log('Form data keys:', Object.keys(formData));
    console.log('PDF size:', pdfBytes.length, 'bytes');

    const overallStart = Date.now();

    try {
      // Load PDF with caching
      const cached = await this.loadPDFWithCache(pdfBytes);
      const { pdfDoc, form, fieldMap, textFields } = cached;

      let totalFilledCount = 0;
      const fillingStart = Date.now();

      // Method 1: Optimized checkbox filling using cached field map
      try {
        const checkboxCount = await this.fillCheckboxesOptimized(fieldMap, documentType, formData);
        console.log(`⚡ Fast checkbox filling: ${checkboxCount} checkboxes`);
        totalFilledCount += checkboxCount;
      } catch (checkboxError) {
        console.warn('Error filling checkboxes:', (checkboxError as Error).message);
      }

      // Method 2: Optimized text replacement using pre-processed text fields
      try {
        const replacedCount = await this.optimizedTextReplacement(textFields, fieldMap, documentType, formData);
        console.log(`⚡ Fast text replacement: ${replacedCount} fields`);
        totalFilledCount += replacedCount;
      } catch (replacementError) {
        console.warn('Error with text replacement:', (replacementError as Error).message);
      }

      // Method 3: FINAL STEP - Comprehensive placeholder cleanup
      try {
        const cleanedCount = await this.fastPlaceholderCleanup(textFields, documentType);
        console.log(`🧹 Final placeholder cleanup: ${cleanedCount} placeholders removed`);
      } catch (cleanupError) {
        console.warn('Error cleaning up placeholders:', (cleanupError as Error).message);
      }

      const fillingTime = Date.now() - fillingStart;
      console.log(`📝 Form filling completed in ${fillingTime}ms (${totalFilledCount} fields filled)`);

      // Save with optimization
      const savedPDF = await this.optimizedSavePDF(pdfDoc);
      
      const totalTime = Date.now() - overallStart;
      console.log(`🏁 TOTAL PROCESS TIME: ${totalTime}ms`);
      
      return savedPDF;

    } catch (processingError) {
      console.error('Error processing PDF:', processingError);
      throw new Error(`PDF processing failed: ${(processingError as Error).message}`);
    }
  }

  /**
   * Optimized checkbox filling using cached field map
   */
  private static async fillCheckboxesOptimized(
    fieldMap: Map<string, any>,
    documentType: string,
    formData: PDFFormData
  ): Promise<number> {
    const checkboxMappings = CHECKBOX_FIELD_MAPPINGS[documentType];
    if (!checkboxMappings) return 0;

    let filledCount = 0;

    // Process checkbox mappings efficiently
    for (const [formFieldKey, optionMappings] of Object.entries(checkboxMappings)) {
      const formValue = formData[formFieldKey];
      if (formValue === null || formValue === undefined) continue;

      const valuesToProcess = Array.isArray(formValue) ? formValue : [formValue];

      for (const value of valuesToProcess) {
        const stringValue = String(value).trim();
        const pdfFieldName = (optionMappings as any)[stringValue];
        
        if (!pdfFieldName) continue;

        // Use cached field map for instant lookup
        const pdfField = fieldMap.get(pdfFieldName);
        
        if (pdfField && pdfField instanceof PDFCheckBox) {
          try {
            this.setCheckboxState(pdfField, true);
            filledCount++;
          } catch (checkError) {
            console.warn(`Failed to check checkbox "${pdfFieldName}":`, (checkError as Error).message);
          }
        }
      }

      // Handle boolean values
      if (typeof formValue === 'boolean') {
        const booleanOption = formValue ? 'Yes' : 'No';
        const pdfFieldName = (optionMappings as any)[booleanOption];
        
        if (pdfFieldName) {
          const pdfField = fieldMap.get(pdfFieldName);
          if (pdfField && pdfField instanceof PDFCheckBox) {
            try {
              this.setCheckboxState(pdfField, formValue);
              filledCount++;
            } catch (checkError) {
              console.warn(`Failed to set boolean checkbox "${pdfFieldName}":`, (checkError as Error).message);
            }
          }
        }
      }
    }

    return filledCount;
  }

  /**
   * Optimized text replacement using pre-processed text fields
   */
  private static async optimizedTextReplacement(
    textFields: PDFTextField[],
    fieldMap: Map<string, any>,
    documentType: string,
    formData: PDFFormData
  ): Promise<number> {
    const fieldsConfig = PLACEHOLDER_DICTIONARY[documentType];
    if (!fieldsConfig) return 0;

    let replacementCount = 0;

    // Pre-compute placeholder lookup for faster processing
    const placeholderLookup = new Map<string, { configKey: string; fieldConfig: any }>();
    Object.entries(fieldsConfig).forEach(([configKey, fieldConfig]) => {
      const config = fieldConfig as any;
      if (config.pdfPlaceholder) {
        placeholderLookup.set(String(config.pdfPlaceholder), { configKey, fieldConfig: config });
      }
    });

    // Process text fields efficiently
    for (const field of textFields) {
      try {
        const fieldName = field.getName() || 'unnamed';
        const currentValue = field.getText() ?? '';

        // Fast placeholder replacement check
        let placeholderFound = false;
        for (const [placeholder, { configKey, fieldConfig }] of placeholderLookup) {
          if (currentValue.includes(placeholder)) {
            const formValue = String(formData[configKey] ?? '');
            if (formValue) {
              const maxLength = field.getMaxLength() || formValue.length;
              const truncatedValue = formValue.slice(0, maxLength);
              
              try {
                field.setText(truncatedValue);
                replacementCount++;
                placeholderFound = true;
                break; // Found and processed, move to next field
              } catch (setError) {
                console.warn(`Failed to set replacement text in field "${fieldName}":`, (setError as Error).message);
              }
            }
          }
        }

        // Direct field matching if no placeholder was found
        if (!placeholderFound) {
          const directMatch = this.findDirectFieldMatchOptimized(fieldName, fieldsConfig, formData);
          if (directMatch) {
            const { dataKey, fieldConfig } = directMatch;
            const formValue = formData[dataKey];
            
            if (formValue !== null && formValue !== undefined && formValue !== '') {
              const formattedValue = this.formatValueForPDF(formValue, fieldConfig);
              const maxLength = field.getMaxLength() || formattedValue.length;
              const finalValue = formattedValue.slice(0, maxLength);

              try {
                if (!field.isReadOnly()) {
                  field.setText(finalValue);
                  replacementCount++;
                }
              } catch (setError) {
                console.warn(`Failed to set text in field "${fieldName}":`, (setError as Error).message);
              }
            }
          }
        }

      } catch (fieldError) {
        console.warn('Error processing field for replacement:', (fieldError as Error).message);
      }
    }

    return replacementCount;
  }

  private static async fastPlaceholderCleanup(
  textFields: PDFTextField[],
  documentType: string
): Promise<number> {
  const PLACEHOLDER_PREFIXES = ["{{", "^^^^", "11/11/1111", "02/02/2222"];
  let cleanedCount = 0;

  for (const field of textFields) {
    try {
      const value = field.getText() ?? "";
      if (!value) continue;

      // Check if value starts with any known placeholder prefix
      if (PLACEHOLDER_PREFIXES.some(prefix => value.startsWith(prefix))) {
        if (!field.isReadOnly()) {
          field.setText(""); // wipe it
          cleanedCount++;
        }
      }
    } catch (err) {
      console.warn("Final cleanup error:", (err as Error).message);
    }
  }

  return cleanedCount;
}


  /**
   * Optimized field matching with caching
   */
  private static findDirectFieldMatchOptimized(
    fieldName: string,
    fieldsConfig: any,
    formData: PDFFormData
  ): { dataKey: string; fieldConfig: any } | null {
    const cacheKey = fieldName.toLowerCase();
    if (this.matchCache.has(cacheKey)) {
      return this.matchCache.get(cacheKey)!;
    }

    const fieldNameLower = fieldName.toLowerCase();

    // Direct PDF field name mapping
    for (const [configKey, fieldConfig] of Object.entries(fieldsConfig)) {
      const config = fieldConfig as any;
      if (config.pdfFieldName && config.pdfFieldName.toLowerCase() === fieldNameLower) {
        if (formData.hasOwnProperty(configKey)) {
          const result = { dataKey: configKey, fieldConfig: config };
          this.matchCache.set(cacheKey, result);
          return result;
        }
      }
    }

    // Fuzzy matching with normalization
    const normalizedFieldName = fieldNameLower.replace(/[_\s-]/g, '');
    for (const dataKey of Object.keys(formData)) {
      const normalizedDataKey = dataKey.toLowerCase().replace(/[_\s-]/g, '');
      
      if (normalizedFieldName === normalizedDataKey ||
          normalizedFieldName.includes(normalizedDataKey) ||
          normalizedDataKey.includes(normalizedFieldName)) {
        const fieldConfig = fieldsConfig[dataKey] || {};
        const result = { dataKey, fieldConfig };
        this.matchCache.set(cacheKey, result);
        return result;
      }
    }

    this.matchCache.set(cacheKey, null);
    return null;
  }

  /**
   * Optimized PDF saving with minimal operations
   */
  private static async optimizedSavePDF(pdfDoc: PDFDocument): Promise<Uint8Array> {
    console.log('💾 Saving PDF with optimization...');
    
    const optimizedOptions = {
      useObjectStreams: false,
      addDefaultPage: false,
      updateFieldAppearances: true
    };

    try {
      // Quick appearance update
      const form = pdfDoc.getForm();
      form.updateFieldAppearances();
    } catch (appearanceError) {
      console.warn('Failed to update field appearances:', (appearanceError as Error).message);
    }
    
    const saveStart = Date.now();
    const pdfBytes = await pdfDoc.save(optimizedOptions);
    const saveTime = Date.now() - saveStart;
    
    console.log(`💾 PDF saved in ${saveTime}ms (${pdfBytes.length} bytes)`);
    return pdfBytes;
  }

  /**
   * Static method to clear cache (useful for memory management)
   */
  static clearCache(): void {
    this.pdfCache.clear();
    this.matchCache.clear();
    console.log('🗑️ PDF cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number; entries: string[] } {
    return {
      size: this.pdfCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries: Array.from(this.pdfCache.keys())
    };
  }

  // Keep existing utility methods
  private static setCheckboxState(checkboxField: PDFCheckBox, shouldBeChecked: boolean): void {
    try {
      if (shouldBeChecked) {
        if (checkboxField.isChecked()) {
          checkboxField.uncheck();
        }
        checkboxField.check();
        
        try {
          const exportValues = (checkboxField as any).getExportValues?.() || ['Yes', 'On', 'True'];
          if (exportValues.length > 0) {
            (checkboxField as any).setValue?.(exportValues[0]);
          }
        } catch (exportError) {
          // Ignore export value errors
        }
      } else {
        checkboxField.uncheck();
      }
      
      try {
        (checkboxField as any).updateAppearances?.();
      } catch (appearanceError) {
        // Ignore appearance update errors
      }
      
    } catch (error) {
      if (shouldBeChecked) {
        checkboxField.check();
      } else {
        checkboxField.uncheck();
      }
    }
  }

  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private static formatValueForPDF(value: any, fieldConfig: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (!fieldConfig) {
      return String(value);
    }

    switch (fieldConfig.fieldType) {
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
        } else if (typeof value === 'string' && value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              });
            }
          } catch {
            // Fall through to return as string
          }
        }
        return String(value);

      case 'number':
        return String(value);

      case 'text':
      case 'textarea':
      default:
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
    }
  }

  /**
   * Enhanced PDF analysis with performance metrics
   */
  static async analyzePDFFormFields(pdfBytes: Uint8Array): Promise<Array<{
    name: string;
    type: string;
    currentText?: string;
    options?: string[];
    defaultValue?: string;
    appearance?: string;
  }>> {
    const analysisStart = Date.now();
    
    try {
      const cached = await this.loadPDFWithCache(pdfBytes);
      const { form } = cached;
      const fields = form.getFields();

      const result = fields.map(field => {
        const fieldInfo: any = {
          name: field.getName() || 'unnamed',
          type: 'unknown'
        };

        try {
          if (field.constructor.name.includes('TextField')) {
            fieldInfo.type = 'text';
            const textField = field as PDFTextField;
            try {
              fieldInfo.currentText = textField.getText() || '';
              fieldInfo.defaultValue = textField.getText() || '';
            } catch (e) {
              fieldInfo.currentText = 'Unable to read';
            }
          } else if (field.constructor.name.includes('CheckBox')) {
            fieldInfo.type = 'checkbox';
            try {
              const checkField = field as PDFCheckBox;
              fieldInfo.defaultValue = checkField.isChecked() ? 'checked' : 'unchecked';
            } catch (e) {
              fieldInfo.defaultValue = 'unknown';
            }
          } else if (field.constructor.name.includes('RadioGroup')) {
            fieldInfo.type = 'radio';
            try {
              const radioField = field as PDFRadioGroup;
              fieldInfo.options = radioField.getOptions();
              fieldInfo.defaultValue = radioField.getSelected();
            } catch (e) {
              fieldInfo.options = ['Unable to read options'];
            }
          } else if (field.constructor.name.includes('Dropdown')) {
            fieldInfo.type = 'dropdown';
            try {
              const dropdownField = field as PDFDropdown;
              fieldInfo.options = dropdownField.getOptions();
              fieldInfo.defaultValue = dropdownField.getSelected();
            } catch (e) {
              fieldInfo.options = ['Unable to read options'];
            }
          }
        } catch (error) {
          fieldInfo.error = (error as Error).message;
        }

        return fieldInfo;
      });

      const analysisTime = Date.now() - analysisStart;
      console.log(`📊 PDF analysis completed in ${analysisTime}ms (${fields.length} fields)`);

      return result;
    } catch (error) {
      console.error('Error analyzing PDF fields:', error);
      return [];
    }
  }
}
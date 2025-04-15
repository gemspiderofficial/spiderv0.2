export function getSpiderImage(genes: string): string {
  // Convert genes to uppercase for consistency
  const upperGenes = genes.toUpperCase();
  
  // Map of gene combinations to image paths
  const geneImageMap: { [key: string]: string } = {
    'S': 'src/assets/S.png',
    'A': 'src/assets/A.png',
    'J': 'src/assets/J.png',
    'SA': 'src/assets/SA.png',
    'SJ': 'src/assets/SJ.png',
    'AJ': 'src/assets/AJ.png',
    'SAJ': 'src/assets/SAJ.png'
  };

  // Check if the gene combination exists in our map
  if (geneImageMap[upperGenes]) {
    return geneImageMap[upperGenes];
  }

  // Fallback to a default image if the gene combination is not found
  console.warn(`No image found for genes: ${genes}, using default image`);
  return 'src/assets/default.png';
} 
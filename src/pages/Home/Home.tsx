import React, { useEffect, useState } from 'react';
import { Canvas } from '../../shared/ui/components/Canvas/Canvas';
import { loadData } from '../../shared/api/spotify/loadData';
import { calculateSimilarityMatrix } from '../../shared/utils/similarity';

export const Home: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [similarityMatrix, setSimilarityMatrix] = useState<number[][]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const loadedData = await loadData();
      setData(loadedData);
      const matrix = calculateSimilarityMatrix(loadedData);
      setSimilarityMatrix(matrix);
    };

    fetchData();
  }, []);

  return (
    <div>
      <Canvas data={data} similarityMatrix={similarityMatrix} />
    </div>
  );
};

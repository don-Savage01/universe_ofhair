interface StarRatingSelectorProps {
  rating: string;
  setRating: (rating: string) => void;
}

export default function StarRatingSelector({
  rating,
  setRating,
}: StarRatingSelectorProps) {
  const handleStarClick = (star: number) => {
    setRating(star.toString());
  };

  const handleHalfStarClick = (star: number) => {
    setRating((star - 0.5).toString());
  };

  const currentRating = parseFloat(rating);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Star Rating
      </label>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
        {/* Star Display */}
        <div className="flex items-center">
          <div className="flex mr-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= currentRating;
              const isHalfFilled =
                currentRating >= star - 0.5 && currentRating < star;

              return (
                <div key={star} className="relative">
                  {/* Background Star (empty) */}
                  <div className="text-2xl text-gray-300">★</div>

                  {/* Filled Star */}
                  {isFilled && (
                    <div className="absolute top-0 left-0 text-2xl text-yellow-400 overflow-hidden w-full">
                      ★
                    </div>
                  )}

                  {/* Half Star */}
                  {isHalfFilled && (
                    <div className="absolute top-0 left-0 text-2xl text-yellow-400 overflow-hidden w-1/2">
                      ★
                    </div>
                  )}

                  {/* Clickable Overlay */}
                  <button
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="absolute top-0 left-0 w-1/2 h-full opacity-0 hover:opacity-20 hover:bg-yellow-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleHalfStarClick(star)}
                    className="absolute top-0 left-1/2 w-1/2 h-full opacity-0 hover:opacity-20 hover:bg-yellow-200"
                  />
                </div>
              );
            })}
          </div>

          {/* Current Rating Display */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800">
              {currentRating.toFixed(1)}
            </span>
            <span className="text-gray-500">/ 5</span>
          </div>
        </div>

        {/* Manual Input */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-24 px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400">
              ★
            </span>
          </div>
          <span className="text-sm text-gray-500">(0.0 to 5.0)</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Click on stars to set rating, or enter value manually
      </p>
    </div>
  );
}

pragma solidity >0.5.0;

/** @title Classic QuickSort. See https://blog.cotten.io/thinking-in-solidity-6670c06390a9 */
contract QuickSort {

  function sort(uint[] memory data) public pure returns(uint[] memory) {
    quickSort(data, int(0), int(data.length - 1));
    return data;
  }

  
  /** @dev Classic quicksort sorting algorithm. 
    * @param arr array to be sorted
    * @param left left-most index of array items needing. Array items to the left of left are already sorted.
    * @param right right-most index of array of items needing sorting. Array items to the right of right are already sorted.
    *
    */
  function quickSort(uint[] memory arr, int left, int right) internal pure {
    int i = left;
    int j = right;
    if (i==j) return;
    uint pivot = arr[uint(left + (right - left) / 2)];
    while (i <= j) {
      while (arr[uint(i)] < pivot) i++;
      while (pivot < arr[uint(j)]) j--;
      if (i <= j) {
        (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
        i++;
        j--;
      }
    }

    if (left < j)
      quickSort(arr, left, j);
    if (i < right)
      quickSort(arr, i, right);
  }
}
